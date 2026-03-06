import { NextRequest, NextResponse } from "next/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { sendPasswordResetEmail } from "@/lib/email"

type Body = {
  email?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Body
    const email = body.email?.trim().toLowerCase()

    if (!email) {
      return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 })
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

    const origin = new URL(request.url).origin
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    )

    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: "recovery",
      email,
      options: {
        redirectTo: `${origin}/auth/callback?next=/auth/reset-password`,
      },
    })

    // Por segurança, sempre retornamos sucesso para evitar enumeração de emails.
    if (linkError || !linkData?.properties?.action_link) {
      console.warn("Falha ao gerar link de recuperação:", linkError?.message)
      return NextResponse.json({ success: true })
    }

    await sendPasswordResetEmail(email, linkData.properties.action_link)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao processar recuperação de senha:", error)
    // Mantém resposta neutra por segurança.
    return NextResponse.json({ success: true })
  }
}
