import { NextRequest, NextResponse } from "next/server"
import {
  getAuthenticatedUserFromRequest,
  resendVerificationEmailForUser,
} from "@/lib/auth/service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const authenticatedUser = await getAuthenticatedUserFromRequest(request)
    const requestedEmail =
      typeof body?.email === "string" ? body.email.trim() : ""
    const email = authenticatedUser?.email || requestedEmail

    if (!email) {
      return NextResponse.json({ error: "Email é obrigatório." }, { status: 400 })
    }

    await resendVerificationEmailForUser(email)

    return NextResponse.json({
      success: true,
      message: "Email de verificação enviado!",
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível reenviar o email de verificação.",
      },
      { status: 400 },
    )
  }
}
