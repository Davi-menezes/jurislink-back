import { NextRequest, NextResponse } from "next/server"
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
  const state = decodeGoogleState(searchParams.get("state"))

  if (error || !code) {
    return NextResponse.redirect(`${origin}/auth/error`)
  }

  try {
    const result = await exchangeGoogleCode(code, state.role)
    const redirectPath = getRedirectPathForRole(result.user.role, state.next)
    const response = NextResponse.redirect(`${origin}${redirectPath}`)
    return attachSessionCookie(response, result.sessionToken)
  } catch {
    return NextResponse.redirect(`${origin}/auth/error`)
  }
}
