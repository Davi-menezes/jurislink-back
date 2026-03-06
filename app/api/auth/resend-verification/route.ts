import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { sendVerificationEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const origin = new URL(request.url).origin
    const supabase = await createClient()
    const body = await request.json().catch(() => ({}))
    const requestedEmail = typeof body?.email === "string" ? body.email.trim().toLowerCase() : ""
    
    // Tenta obter email do usuário logado; se não houver sessão, usa o email informado no body.
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const email = user?.email ?? requestedEmail

    if (!email) {
      return NextResponse.json(
        { error: "Email é obrigatório" },
        { status: 400 }
      )
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      || process.env.SUPABASE_SECRET_KEY
    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: "SUPABASE_SERVICE_ROLE_KEY não configurada no backend." },
        { status: 500 }
      )
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "RESEND_API_KEY não configurada no backend." },
        { status: 500 }
      )
    }

    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    )

    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: "signup",
      email,
      options: {
        redirectTo: `${origin}/auth/callback`,
      }
    })

    if (linkError || !linkData?.properties?.action_link) {
      console.warn("Falha ao gerar link de verificação:", linkError?.message)
      // Resposta neutra evita enumeração de emails.
      return NextResponse.json({ success: true })
    }

    await sendVerificationEmail(email, linkData.properties.action_link)

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
