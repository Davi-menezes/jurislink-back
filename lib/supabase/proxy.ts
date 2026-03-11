import { NextResponse, type NextRequest } from "next/server"
import { authConfig } from "@/lib/auth/config"
import { verifySessionToken } from "@/lib/auth/jwt"

function buildLoginRedirect(request: NextRequest) {
  const url = request.nextUrl.clone()
  url.pathname = "/auth/login"
  if (request.nextUrl.pathname !== "/auth/login") {
    url.searchParams.set("next", request.nextUrl.pathname)
  }
  return NextResponse.redirect(url)
}

function buildHomeRedirect(request: NextRequest) {
  const url = request.nextUrl.clone()
  url.pathname = "/"
  url.search = ""
  return NextResponse.redirect(url)
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const token = request.cookies.get(authConfig.sessionCookieName)?.value

  let session = null
  if (token) {
    try {
      session = await verifySessionToken(token)
    } catch {
      session = null
    }
  }

  if (!pathname.startsWith("/painel")) {
    return NextResponse.next({ request })
  }

  if (!session) {
    return buildLoginRedirect(request)
  }

  if (pathname.startsWith("/painel/admin") && session.role !== "ADMIN") {
    return buildHomeRedirect(request)
  }

  if (pathname.startsWith("/painel/advogado") && session.role !== "LAWYER") {
    return buildHomeRedirect(request)
  }

  if (pathname.startsWith("/painel/cliente") && session.role !== "CLIENT") {
    return buildHomeRedirect(request)
  }

  return NextResponse.next({ request })
}
