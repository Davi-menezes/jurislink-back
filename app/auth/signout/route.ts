import { NextResponse } from "next/server"
import { clearSessionCookieFromResponse } from "@/lib/auth/session"

export async function POST(request: Request) {
  const { origin } = new URL(request.url)
  const response = NextResponse.redirect(`${origin}/`, { status: 302 })
  return clearSessionCookieFromResponse(response)
}
