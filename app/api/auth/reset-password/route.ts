import { NextRequest, NextResponse } from "next/server"
import { resetPasswordWithToken } from "@/lib/auth/service"

type Body = {
  token?: string
  password?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Body
    await resetPasswordWithToken(body.token || "", body.password || "")

    return NextResponse.json({
      success: true,
      message: "Senha redefinida com sucesso.",
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível redefinir sua senha.",
      },
      { status: 400 },
    )
  }
}
