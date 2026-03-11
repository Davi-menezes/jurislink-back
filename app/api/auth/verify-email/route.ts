import { NextRequest, NextResponse } from "next/server"
import { verifyEmailToken } from "@/lib/auth/service"
import { attachSessionCookie } from "@/lib/auth/session"

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token") || ""
    const result = await verifyEmailToken(token)
    const response = NextResponse.json({
      success: true,
      user: result.user,
      redirectPath: result.redirectPath,
      token: result.sessionToken,
    })

    return attachSessionCookie(response, result.sessionToken)
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível verificar seu email.",
      },
      { status: 400 },
    )
  }
}
