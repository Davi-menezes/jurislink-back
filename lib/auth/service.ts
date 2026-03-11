import { NextRequest } from "next/server"
import { authConfig } from "@/lib/auth/config"
import { hashPassword, verifyPassword } from "@/lib/auth/password"
import {
  createSessionToken,
  getSessionPayloadFromCookies,
  getSessionPayloadFromRequest,
} from "@/lib/auth/session"
import { createAdminClient, createPublicClient } from "@/lib/supabase/admin"
import {
  generateSecureToken,
  hashData,
  isValidEmail,
  sanitizeInput,
  validatePasswordStrength,
} from "@/lib/security"
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/email"
import type { Profile, UserRole } from "@/lib/types"

const EMAIL_TOKEN_HOURS = 24
const PASSWORD_RESET_HOURS = 1

type UserRecord = {
  id: string
  email: string
  password_hash: string | null
  role: UserRole
  full_name: string
  status: string
  is_email_verified: boolean
  google_id: string | null
  email_verification_token: string | null
  email_verification_expires: string | null
  password_reset_token: string | null
  password_reset_expires: string | null
  created_at?: string
  updated_at?: string
}

type ProfileRecord = Profile & {
  email?: string | null
  email_verified?: boolean
}

export type AuthenticatedUser = {
  id: string
  email: string
  role: UserRole
  fullName: string
  status: string
  isEmailVerified: boolean
  avatarUrl: string | null
  state: string | null
  city: string | null
  phone: string | null
  isActive: boolean
  profile: ProfileRecord | null
}

type RegisterInput = {
  fullName: string
  email: string
  password: string
  role: UserRole
  lgpdAccepted: boolean
}

type GoogleProfile = {
  sub: string
  email: string
  email_verified: boolean
  name?: string
  picture?: string
}

function normalizeEmail(email: string) {
  return sanitizeInput(email).toLowerCase()
}

function normalizeName(name: string) {
  return sanitizeInput(name)
}

function expirationFromNow(hours: number) {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()
}

function buildVerificationUrl(token: string) {
  return `${authConfig.appUrl}/auth/verify?token=${encodeURIComponent(token)}`
}

function buildResetUrl(token: string) {
  return `${authConfig.appUrl}/auth/reset-password?token=${encodeURIComponent(token)}`
}

function buildStatus(isEmailVerified: boolean) {
  return isEmailVerified ? "VERIFIED" : "CREATED"
}

function buildDashboardPath(role: UserRole) {
  if (role === "LAWYER") return "/painel/advogado"
  if (role === "ADMIN") return "/painel/admin"
  return "/painel/cliente"
}

function mapAuthenticatedUser(user: UserRecord, profile: ProfileRecord | null): AuthenticatedUser {
  return {
    id: user.id,
    email: user.email,
    role: profile?.role || user.role,
    fullName: profile?.full_name || user.full_name,
    status: user.status,
    isEmailVerified: user.is_email_verified,
    avatarUrl: profile?.avatar_url || null,
    state: profile?.state || null,
    city: profile?.city || null,
    phone: profile?.phone || null,
    isActive: profile?.is_active ?? true,
    profile,
  }
}

async function getUserById(userId: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data as UserRecord | null
}

async function getUserByEmail(email: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", normalizeEmail(email))
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data as UserRecord | null
}

async function getUserByToken(column: "email_verification_token" | "password_reset_token", rawToken: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq(column, hashData(rawToken))
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data as UserRecord | null
}

async function getProfileById(userId: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data as ProfileRecord | null
}

async function ensureProfileSync(
  user: Pick<UserRecord, "id" | "email" | "role" | "full_name" | "is_email_verified">,
  overrides?: {
    avatarUrl?: string | null
    lgpdAccepted?: boolean
    lgpdAcceptedAt?: string | null
  },
) {
  const supabase = createAdminClient()
  const payload: Record<string, unknown> = {
    id: user.id,
    email: user.email,
    role: user.role,
    full_name: user.full_name,
    email_verified: user.is_email_verified,
  }

  if (typeof overrides?.avatarUrl !== "undefined") {
    payload.avatar_url = overrides.avatarUrl
  }
  if (typeof overrides?.lgpdAccepted !== "undefined") {
    payload.lgpd_accepted = overrides.lgpdAccepted
    payload.lgpd_accepted_at =
      overrides.lgpdAccepted && overrides.lgpdAcceptedAt !== undefined
        ? overrides.lgpdAcceptedAt
        : overrides.lgpdAccepted
          ? new Date().toISOString()
          : null
  }

  const { error } = await supabase.from("profiles").upsert(payload, {
    onConflict: "id",
  })

  if (error) {
    throw new Error(error.message)
  }
}

async function sendVerificationTokenEmail(email: string, token: string) {
  await sendVerificationEmail(email, buildVerificationUrl(token))
}

async function sendPasswordResetTokenEmail(email: string, token: string) {
  await sendPasswordResetEmail(email, buildResetUrl(token))
}

async function syncLegacyPasswordHash(email: string, password: string, existingUser: UserRecord | null) {
  try {
    const legacyClient = createPublicClient()
    const { data, error } = await legacyClient.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return {
        migratedUser: null,
        errorCode: error.message === "Email not confirmed" ? "EMAIL_NOT_VERIFIED" : "INVALID_CREDENTIALS",
      }
    }

    const legacyUser = data.user
    if (!legacyUser?.email) {
      return {
        migratedUser: null,
        errorCode: "INVALID_CREDENTIALS",
      }
    }

    const normalizedEmail = normalizeEmail(legacyUser.email)
    const passwordHash = await hashPassword(password)
    const nextUserId = existingUser?.id || legacyUser.id
    const fullName =
      normalizeName(String(legacyUser.user_metadata?.full_name || legacyUser.user_metadata?.name || "")) ||
      existingUser?.full_name ||
      normalizedEmail.split("@")[0]
    const role = (legacyUser.user_metadata?.role || existingUser?.role || "CLIENT") as UserRole
    const isEmailVerified = Boolean(legacyUser.email_confirmed_at)

    const upsertPayload = {
      id: nextUserId,
      email: normalizedEmail,
      password_hash: passwordHash,
      role,
      full_name: fullName,
      status: buildStatus(isEmailVerified),
      is_email_verified: isEmailVerified,
      google_id: existingUser?.google_id || null,
    }

    const supabase = createAdminClient()
    const { data: migratedUser, error: upsertError } = await supabase
      .from("users")
      .upsert(upsertPayload, { onConflict: "id" })
      .select("*")
      .single()

    if (upsertError) {
      throw new Error(upsertError.message)
    }

    await ensureProfileSync(migratedUser as UserRecord, {
      avatarUrl: String(legacyUser.user_metadata?.avatar_url || legacyUser.user_metadata?.picture || "") || null,
      lgpdAccepted:
        existingUser?.id !== undefined
          ? undefined
          : Boolean(legacyUser.user_metadata?.lgpd_accepted),
      lgpdAcceptedAt: Boolean(legacyUser.user_metadata?.lgpd_accepted)
        ? new Date().toISOString()
        : null,
    })

    return {
      migratedUser: migratedUser as UserRecord,
      errorCode: null,
    }
  } catch {
    return {
      migratedUser: null,
      errorCode: "INVALID_CREDENTIALS",
    }
  }
}

function validatePasswordOrThrow(password: string) {
  const passwordValidation = validatePasswordStrength(password)
  if (!passwordValidation.valid) {
    throw new Error(passwordValidation.errors[0] || "Senha inválida.")
  }
}

async function createAuthResponseUser(user: UserRecord) {
  const profile = await getProfileById(user.id)
  const authenticatedUser = mapAuthenticatedUser(user, profile)
  const sessionToken = await createSessionToken({
    sub: user.id,
    email: user.email,
    role: authenticatedUser.role,
  })

  return {
    user: authenticatedUser,
    sessionToken,
    redirectPath: buildDashboardPath(authenticatedUser.role),
  }
}

export async function registerUser(input: RegisterInput) {
  const fullName = normalizeName(input.fullName)
  const email = normalizeEmail(input.email)

  if (!fullName || !email || !input.password) {
    throw new Error("Nome, email e senha são obrigatórios.")
  }

  if (!isValidEmail(email)) {
    throw new Error("Informe um email válido.")
  }

  if (!input.lgpdAccepted) {
    throw new Error("É necessário aceitar os termos de uso e a política de privacidade.")
  }

  validatePasswordOrThrow(input.password)

  const existingUser = await getUserByEmail(email)
  const verificationToken = generateSecureToken(32)
  const verificationTokenHash = hashData(verificationToken)
  const passwordHash = await hashPassword(input.password)
  const verificationExpires = expirationFromNow(EMAIL_TOKEN_HOURS)

  const supabase = createAdminClient()

  if (existingUser) {
    if (existingUser.is_email_verified) {
      throw new Error("Este email já está em uso.")
    }

    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({
        password_hash: passwordHash,
        role: input.role,
        full_name: fullName,
        email_verification_token: verificationTokenHash,
        email_verification_expires: verificationExpires,
        status: "CREATED",
      })
      .eq("id", existingUser.id)
      .select("*")
      .single()

    if (updateError) {
      throw new Error(updateError.message)
    }

    await ensureProfileSync(updatedUser as UserRecord, {
      lgpdAccepted: true,
      lgpdAcceptedAt: new Date().toISOString(),
    })
    await sendVerificationTokenEmail(email, verificationToken)

    return {
      status: "verification_resent" as const,
      message: "Seu cadastro já existia. Reenviamos o email de verificação.",
    }
  }

  const { data: user, error } = await supabase
    .from("users")
    .insert({
      email,
      password_hash: passwordHash,
      role: input.role,
      full_name: fullName,
      status: "CREATED",
      is_email_verified: false,
      email_verification_token: verificationTokenHash,
      email_verification_expires: verificationExpires,
    })
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  await ensureProfileSync(user as UserRecord, {
    lgpdAccepted: true,
    lgpdAcceptedAt: new Date().toISOString(),
  })
  await sendVerificationTokenEmail(email, verificationToken)

  return {
    status: "created" as const,
    message: "Conta criada com sucesso. Verifique seu email para ativá-la.",
  }
}

export async function loginUser(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email)

  if (!normalizedEmail || !password) {
    throw new Error("Email e senha são obrigatórios.")
  }

  let user = await getUserByEmail(normalizedEmail)
  let passwordMatches = false

  if (user?.password_hash) {
    passwordMatches = await verifyPassword(password, user.password_hash)
  }

  if ((!user || !passwordMatches) && user?.password_hash) {
    throw new Error("Credenciais inválidas.")
  }

  if (!user || !passwordMatches) {
    const legacyLogin = await syncLegacyPasswordHash(normalizedEmail, password, user)

    if (!legacyLogin.migratedUser) {
      if (legacyLogin.errorCode === "EMAIL_NOT_VERIFIED") {
        throw new Error("Por favor, verifique seu email para ativar sua conta.")
      }

      throw new Error("Credenciais inválidas.")
    }

    user = legacyLogin.migratedUser
  }

  if (!user.is_email_verified || user.status === "CREATED") {
    throw new Error("Por favor, verifique seu email para ativar sua conta.")
  }

  return createAuthResponseUser(user)
}

export async function verifyEmailToken(token: string) {
  if (!token) {
    throw new Error("Token de verificação inválido.")
  }

  const user = await getUserByToken("email_verification_token", token)
  if (!user || !user.email_verification_expires) {
    throw new Error("Token de verificação inválido ou expirado.")
  }

  if (new Date(user.email_verification_expires) < new Date()) {
    throw new Error("Token de verificação inválido ou expirado.")
  }

  const supabase = createAdminClient()
  const { data: updatedUser, error } = await supabase
    .from("users")
    .update({
      status: "VERIFIED",
      is_email_verified: true,
      email_verification_token: null,
      email_verification_expires: null,
    })
    .eq("id", user.id)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  await ensureProfileSync(updatedUser as UserRecord)
  return createAuthResponseUser(updatedUser as UserRecord)
}

export async function resendVerificationEmailForUser(email: string) {
  const normalizedEmail = normalizeEmail(email)

  if (!normalizedEmail) {
    throw new Error("Email é obrigatório.")
  }

  const user = await getUserByEmail(normalizedEmail)
  if (!user) {
    throw new Error("Não encontramos uma conta com esse email.")
  }

  if (user.is_email_verified) {
    throw new Error("Este email já foi verificado.")
  }

  const verificationToken = generateSecureToken(32)
  const verificationTokenHash = hashData(verificationToken)
  const verificationExpires = expirationFromNow(EMAIL_TOKEN_HOURS)
  const supabase = createAdminClient()

  const { error } = await supabase
    .from("users")
    .update({
      email_verification_token: verificationTokenHash,
      email_verification_expires: verificationExpires,
    })
    .eq("id", user.id)

  if (error) {
    throw new Error(error.message)
  }

  await sendVerificationTokenEmail(normalizedEmail, verificationToken)
}

export async function createPasswordReset(email: string) {
  const normalizedEmail = normalizeEmail(email)

  if (!normalizedEmail) {
    throw new Error("Email é obrigatório.")
  }

  const user = await getUserByEmail(normalizedEmail)
  if (!user) {
    return
  }

  const resetToken = generateSecureToken(32)
  const resetTokenHash = hashData(resetToken)
  const resetExpires = expirationFromNow(PASSWORD_RESET_HOURS)
  const supabase = createAdminClient()

  const { error } = await supabase
    .from("users")
    .update({
      password_reset_token: resetTokenHash,
      password_reset_expires: resetExpires,
    })
    .eq("id", user.id)

  if (error) {
    throw new Error(error.message)
  }

  await sendPasswordResetTokenEmail(normalizedEmail, resetToken)
}

export async function resetPasswordWithToken(token: string, password: string) {
  if (!token || !password) {
    throw new Error("Token e nova senha são obrigatórios.")
  }

  validatePasswordOrThrow(password)

  const user = await getUserByToken("password_reset_token", token)
  if (!user || !user.password_reset_expires) {
    throw new Error("Token de redefinição inválido ou expirado.")
  }

  if (new Date(user.password_reset_expires) < new Date()) {
    throw new Error("Token de redefinição inválido ou expirado.")
  }

  const passwordHash = await hashPassword(password)
  const supabase = createAdminClient()
  const { error } = await supabase
    .from("users")
    .update({
      password_hash: passwordHash,
      password_reset_token: null,
      password_reset_expires: null,
    })
    .eq("id", user.id)

  if (error) {
    throw new Error(error.message)
  }
}

export async function getCurrentAuthenticatedUser() {
  const session = await getSessionPayloadFromCookies()

  if (!session?.sub) {
    return null
  }

  const user = await getUserById(session.sub)
  if (!user) {
    return null
  }

  const profile = await getProfileById(user.id)
  return mapAuthenticatedUser(user, profile)
}

export async function getAuthenticatedUserFromRequest(request: NextRequest) {
  const session = await getSessionPayloadFromRequest(request)
  if (!session?.sub) {
    return null
  }

  const user = await getUserById(session.sub)
  if (!user) {
    return null
  }

  const profile = await getProfileById(user.id)
  return mapAuthenticatedUser(user, profile)
}

export function isRoleAllowed(userRole: UserRole, allowedRoles?: UserRole[]) {
  if (!allowedRoles || allowedRoles.length === 0) {
    return true
  }

  return allowedRoles.includes(userRole)
}

export async function exchangeGoogleCode(code: string, role?: UserRole) {
  const params = new URLSearchParams({
    code,
    client_id: authConfig.googleClientId,
    client_secret: authConfig.googleClientSecret,
    redirect_uri: authConfig.googleCallbackUrl,
    grant_type: "authorization_code",
  })

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  })

  if (!tokenResponse.ok) {
    throw new Error("Não foi possível concluir o login com o Google.")
  }

  const tokenData = await tokenResponse.json()
  const accessToken = tokenData.access_token as string | undefined

  if (!accessToken) {
    throw new Error("O Google não retornou um token de acesso válido.")
  }

  const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!userInfoResponse.ok) {
    throw new Error("Não foi possível obter o perfil do Google.")
  }

  const googleProfile = (await userInfoResponse.json()) as GoogleProfile
  if (!googleProfile.email) {
    throw new Error("O Google não retornou um email para esta conta.")
  }

  const email = normalizeEmail(googleProfile.email)
  const fullName =
    normalizeName(String(googleProfile.name || "")) || email.split("@")[0]
  const normalizedRole = role || "CLIENT"
  const isEmailVerified = googleProfile.email_verified !== false
  const supabase = createAdminClient()

  let user = await getUserByEmail(email)

  if (user) {
    const { data: updatedUser, error } = await supabase
      .from("users")
      .update({
        google_id: googleProfile.sub,
        full_name: user.full_name || fullName,
        status: buildStatus(true),
        is_email_verified: true,
      })
      .eq("id", user.id)
      .select("*")
      .single()

    if (error) {
      throw new Error(error.message)
    }

    user = updatedUser as UserRecord
  } else {
    const { data: createdUser, error } = await supabase
      .from("users")
      .insert({
        email,
        password_hash: null,
        role: normalizedRole,
        full_name: fullName,
        status: buildStatus(isEmailVerified),
        is_email_verified: isEmailVerified,
        google_id: googleProfile.sub,
      })
      .select("*")
      .single()

    if (error) {
      throw new Error(error.message)
    }

    user = createdUser as UserRecord
  }

  await ensureProfileSync(user, {
    avatarUrl: googleProfile.picture || null,
  })

  return createAuthResponseUser(user)
}

export async function buildGoogleAuthorizationUrl(role?: UserRole, next?: string) {
  if (!authConfig.googleClientId || !authConfig.googleClientSecret) {
    throw new Error("Google OAuth não configurado no ambiente.")
  }

  const statePayload = Buffer.from(
    JSON.stringify({
      role: role || "CLIENT",
      next: next && next.startsWith("/") ? next : null,
    }),
  ).toString("base64url")

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth")
  url.searchParams.set("client_id", authConfig.googleClientId)
  url.searchParams.set("redirect_uri", authConfig.googleCallbackUrl)
  url.searchParams.set("response_type", "code")
  url.searchParams.set("scope", "openid email profile")
  url.searchParams.set("prompt", "select_account")
  url.searchParams.set("state", statePayload)

  return url.toString()
}

export function decodeGoogleState(state: string | null) {
  if (!state) {
    return {
      role: "CLIENT" as UserRole,
      next: null as string | null,
    }
  }

  try {
    const payload = JSON.parse(Buffer.from(state, "base64url").toString("utf8"))
    return {
      role: (payload.role === "LAWYER" || payload.role === "ADMIN" ? payload.role : "CLIENT") as UserRole,
      next: typeof payload.next === "string" && payload.next.startsWith("/") ? payload.next : null,
    }
  } catch {
    return {
      role: "CLIENT" as UserRole,
      next: null as string | null,
    }
  }
}

export function getRedirectPathForRole(role: UserRole, next?: string | null) {
  if (next && next.startsWith("/")) {
    return next
  }

  return buildDashboardPath(role)
}
