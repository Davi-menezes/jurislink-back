import { jwtVerify, SignJWT } from "jose"
import { authConfig } from "@/lib/auth/config"
import type { UserRole } from "@/lib/types"

export interface SessionPayload {
  sub: string
  email: string
  role: UserRole
}

function getSecret() {
  return new TextEncoder().encode(authConfig.jwtSecret())
}

export async function signSessionToken(payload: SessionPayload) {
  return new SignJWT({
    email: payload.email,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(authConfig.jwtExpiresIn)
    .sign(getSecret())
}

export async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify(token, getSecret())

  return {
    sub: String(payload.sub),
    email: String(payload.email),
    role: String(payload.role) as UserRole,
  }
}
