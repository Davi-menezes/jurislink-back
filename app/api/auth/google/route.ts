import { NextRequest, NextResponse } from "next/server"
import { buildGoogleAuthorizationUrl } from "@/lib/auth/service"
import type { UserRole } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const roleParam = request.nextUrl.searchParams.get("role")
    const next = request.nextUrl.searchParams.get("next") || undefined
    const role =
      roleParam === "LAWYER" || roleParam === "ADMIN" || roleParam === "CLIENT"
        ? (roleParam as UserRole)
        : undefined

    const url = await buildGoogleAuthorizationUrl(role, next)
    return NextResponse.redirect(url)
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível iniciar o login com o Google.",
      },
      { status: 400 },
    )
  }
}
