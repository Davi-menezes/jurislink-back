import { NextRequest, NextResponse } from "next/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { sendVerificationEmail } from "@/lib/email"
import type { UserRole } from "@/lib/types"

type Body = {
  fullName?: string
  email?: string
  password?: string
  role?: UserRole
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Body
    const fullName = body.fullName?.trim()
    const email = body.email?.trim().toLowerCase()
    const password = body.password
    const role = body.role ?? "CLIENT"

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: "Nome, email e senha são obrigatórios." },
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

    const origin = new URL(request.url).origin
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    )

    const { data: createdUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: {
        full_name: fullName,
        role,
      },
    })

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 })
    }

    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: "signup",
      email,
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    })

    if (linkError || !linkData?.properties?.action_link) {
      console.error("Falha ao gerar link de verificação:", linkError)
      return NextResponse.json(
        { error: "Conta criada, mas falhou o envio do email de verificação." },
        { status: 500 }
      )
    }

    await sendVerificationEmail(email, linkData.properties.action_link)

    return NextResponse.json({
      success: true,
      userId: createdUser.user?.id ?? null,
    })
  } catch (error) {
    console.error("Erro ao criar conta:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
