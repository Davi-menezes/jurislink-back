import { NextRequest, NextResponse } from "next/server"
import { authConfig } from "@/lib/auth/config"
import {
  decodeGoogleState,
  exchangeGoogleCode,
  getRedirectPathForRole,
} from "@/lib/auth/service"
import { attachSessionCookie } from "@/lib/auth/session"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")
  const errorDescription = searchParams.get("error_description")
  const state = decodeGoogleState(searchParams.get("state"))

  if (error || !code) {
    const url = new URL("/auth/error", authConfig.frontendUrl)
    if (error) {
      url.searchParams.set("reason", error)
    }
    if (errorDescription) {
      url.searchParams.set("details", errorDescription)
    }
    if (!code && !error) {
      url.searchParams.set("reason", "missing_code")
    }
    return NextResponse.redirect(url.toString())
  }

  try {
    const result = await exchangeGoogleCode(code, state.role)
    const redirectPath = getRedirectPathForRole(result.user.role, state.next)
    const callbackUrl = new URL("/auth/callback", authConfig.frontendUrl)
    callbackUrl.searchParams.set("token", result.sessionToken)
    callbackUrl.searchParams.set("next", redirectPath)
    const response = NextResponse.redirect(callbackUrl.toString())
    return attachSessionCookie(response, result.sessionToken)
  } catch (caughtError) {
    const message =
      caughtError instanceof Error ? caughtError.message : "Erro desconhecido no callback do Google."
    console.error("Google auth callback failed:", {
      message,
      callbackUrl: request.url,
      configuredGoogleCallbackUrl: process.env.GOOGLE_CALLBACK_URL,
      configuredAppUrl: process.env.NEXT_PUBLIC_APP_URL,
      hasGoogleClientId: Boolean(process.env.GOOGLE_CLIENT_ID),
      hasGoogleClientSecret: Boolean(process.env.GOOGLE_CLIENT_SECRET),
      hasJwtSecret: Boolean(process.env.JWT_SECRET),
      hasSupabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      hasSupabaseServiceRoleKey: Boolean(
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY,
      ),
    })

    const url = new URL("/auth/error", authConfig.frontendUrl)
    url.searchParams.set("reason", "callback_failed")
    url.searchParams.set("details", message)
    return NextResponse.redirect(url.toString())
  }
}
