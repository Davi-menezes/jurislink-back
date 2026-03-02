import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const origin = new URL(request.url).origin
    const supabase = await createClient()
    
    // Verificar se o usuário está autenticado
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !user.email) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    // Gerar novo link de verificação
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: user.email,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      }
    })

    if (resendError) {
      console.error("Erro ao reenviar email:", resendError)
      return NextResponse.json(
        { error: "Erro ao enviar email" },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: "Email de verificação enviado!" 
    })
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
