import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getAuthenticatedUserFromRequest } from "@/lib/auth/service"
import { createPaymentPreference } from "@/lib/mercadopago/client"

// POST - Criar pagamento para boost
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const user = await getAuthenticatedUserFromRequest(request)

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const profile = user.profile

  if (!profile || profile.role !== "LAWYER") {
    return NextResponse.json({ error: "Apenas advogados podem ativar boost" }, { status: 403 })
  }

  const { data: lawyerProfile } = await supabase
    .from("lawyer_profiles")
    .select("id, boost_until, subscription_status")
    .eq("user_id", user.id)
    .single()

  if (!lawyerProfile) {
    return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 })
  }

  // Verificar se já tem boost ativo
  if (lawyerProfile.boost_until && new Date(lawyerProfile.boost_until) > new Date()) {
    return NextResponse.json({ error: "Você já possui boost ativo" }, { status: 400 })
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    const preference = await createPaymentPreference({
      title: "JurisLink - Boost 30 dias",
      description: "Destaque seu perfil no topo das buscas por 30 dias",
      price: 99.00,
      quantity: 1,
      external_reference: `boost_${lawyerProfile.id}_${Date.now()}`,
      payer_email: profile.email || user.email,
      back_urls: {
        success: `${baseUrl}/painel/advogado?boost=sucesso`,
        failure: `${baseUrl}/painel/advogado?boost=erro`,
        pending: `${baseUrl}/painel/advogado?boost=pendente`,
      },
      auto_return: 'approved',
      notification_url: `${baseUrl}/api/payments/webhook`,
    })

    await supabase
      .from("payments")
      .insert({
        lawyer_id: lawyerProfile.id,
        type: "BOOST",
        status: "PENDING",
        amount_cents: 9900,
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
    console.error("Boost payment error:", error)
    return NextResponse.json({ error: "Erro ao criar pagamento" }, { status: 500 })
  }
}
