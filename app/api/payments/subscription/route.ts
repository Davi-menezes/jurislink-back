import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getAuthenticatedUserFromRequest } from "@/lib/auth/service"
import { createPaymentPreference } from "@/lib/mercadopago/client"

// POST - Criar pagamento para assinatura Premium
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const user = await getAuthenticatedUserFromRequest(request)

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  // Verificar se é advogado
  const profile = user.profile

  if (!profile || profile.role !== "LAWYER") {
    return NextResponse.json({ error: "Apenas advogados podem assinar" }, { status: 403 })
  }

  // Buscar perfil do advogado
  const { data: lawyerProfile } = await supabase
    .from("lawyer_profiles")
    .select("id, subscription_status")
    .eq("user_id", user.id)
    .single()

  if (!lawyerProfile) {
    return NextResponse.json({ error: "Perfil de advogado não encontrado" }, { status: 404 })
  }

  if (lawyerProfile.subscription_status === "ACTIVE") {
    return NextResponse.json({ error: "Você já possui assinatura ativa" }, { status: 400 })
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    // Criar preferência de pagamento no Mercado Pago
    const preference = await createPaymentPreference({
      title: "JurisLink - Plano Premium Mensal",
      description: "Assinatura mensal para aparecer nas buscas e receber leads",
      price: 99.90,
      quantity: 1,
      external_reference: `subscription_${lawyerProfile.id}_${Date.now()}`,
      payer_email: profile.email || user.email,
      back_urls: {
        success: `${baseUrl}/painel/advogado/assinatura/sucesso`,
        failure: `${baseUrl}/painel/advogado/assinatura/erro`,
        pending: `${baseUrl}/painel/advogado/assinatura/pendente`,
      },
      auto_return: 'approved',
      notification_url: `${baseUrl}/api/payments/webhook`,
    })

    // Criar registro de pagamento pendente
    await supabase
      .from("payments")
      .insert({
        lawyer_id: lawyerProfile.id,
        type: "SUBSCRIPTION",
        status: "PENDING",
        amount_cents: 9990, // R$ 99.90
        external_id: preference.id,
        metadata: {
          preference_id: preference.id,
          init_point: preference.init_point,
          sandbox_init_point: preference.sandbox_init_point,
        },
      })

    return NextResponse.json({
      preference_id: preference.id,
      init_point: process.env.MERCADO_PAGO_SANDBOX === 'true' 
        ? preference.sandbox_init_point 
        : preference.init_point,
    })
  } catch (error) {
    console.error("Payment error:", error)
    return NextResponse.json({ 
      error: "Erro ao criar pagamento" 
    }, { status: 500 })
  }
}
