const DEFAULT_JWT_EXPIRES_IN = "7d"
const DEFAULT_SESSION_COOKIE = "jurislink_session"

function getRequiredEnv(name: string) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} não configurada no ambiente.`)
  }

  return value
}

function parseDurationToSeconds(value: string) {
  const match = value.trim().match(/^(\d+)([smhd])$/i)
  if (!match) {
    return 60 * 60 * 24 * 7
  }

  const amount = Number(match[1])
  const unit = match[2].toLowerCase()

  if (unit === "s") return amount
  if (unit === "m") return amount * 60
  if (unit === "h") return amount * 60 * 60
  return amount * 60 * 60 * 24
}

export const authConfig = {
  jwtSecret: () => getRequiredEnv("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || DEFAULT_JWT_EXPIRES_IN,
  sessionCookieName: process.env.SESSION_COOKIE_NAME || DEFAULT_SESSION_COOKIE,
  sessionMaxAgeSeconds: parseDurationToSeconds(
    process.env.JWT_EXPIRES_IN || DEFAULT_JWT_EXPIRES_IN,
  ),
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  googleCallbackUrl:
    process.env.GOOGLE_CALLBACK_URL ||
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback`,
}
