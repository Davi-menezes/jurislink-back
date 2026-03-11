import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { authConfig } from "@/lib/auth/config"
import { signSessionToken, verifySessionToken, type SessionPayload } from "@/lib/auth/jwt"

function getCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: authConfig.sessionMaxAgeSeconds,
  }
}

export async function createSessionToken(payload: SessionPayload) {
  return signSessionToken(payload)
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(authConfig.sessionCookieName, token, getCookieOptions())
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(authConfig.sessionCookieName)
}

export async function getSessionPayloadFromCookies() {
  const cookieStore = await cookies()
  const token = cookieStore.get(authConfig.sessionCookieName)?.value

  if (!token) {
    return null
  }

  try {
    return await verifySessionToken(token)
  } catch {
    return null
  }
}

export async function getSessionPayloadFromRequest(request: NextRequest) {
  const authorization = request.headers.get("authorization")
  const bearerToken = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : null
  const cookieToken = request.cookies.get(authConfig.sessionCookieName)?.value
  const token = bearerToken || cookieToken

  if (!token) {
    return null
  }

  try {
    return await verifySessionToken(token)
  } catch {
    return null
  }
}

export function attachSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(authConfig.sessionCookieName, token, getCookieOptions())
  return response
}

export function clearSessionCookieFromResponse(response: NextResponse) {
  response.cookies.delete(authConfig.sessionCookieName)
  return response
}
