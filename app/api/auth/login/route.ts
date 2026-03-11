import { NextRequest, NextResponse } from "next/server"
import { loginUser } from "@/lib/auth/service"
import { attachSessionCookie } from "@/lib/auth/session"

type Body = {
  email?: string
  password?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Body
    const result = await loginUser(body.email?.trim() || "", body.password || "")
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
            : "Não foi possível realizar o login.",
      },
      { status: 401 },
    )
  }
}
