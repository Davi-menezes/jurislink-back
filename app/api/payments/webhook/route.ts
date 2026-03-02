import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getPaymentInfo } from "@/lib/mercadopago/client"

// Webhook do Mercado Pago
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  try {
    const body = await request.json()
    
    // Mercado Pago envia notificações sobre pagamentos
    // https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
    
    if (body.type === "payment") {
      const paymentId = body.data?.id
      
      if (!paymentId) {
        return NextResponse.json({ error: "No payment ID" }, { status: 400 })
      }

      // Buscar informações do pagamento
      const paymentInfo = await getPaymentInfo(paymentId)
      
      // Buscar registro na nossa base
      const { data: payment } = await supabase
        .from("payments")
        .select("*")
        .eq("external_id", paymentInfo.external_reference?.split("_")[0] || "")
        .or(`metadata->preference_id.eq.${paymentInfo.preference_id}`)
        .single()

      if (!payment) {
        console.error("Payment not found:", paymentInfo.external_reference)
        return NextResponse.json({ received: true })
      }

      // Atualizar status do pagamento
      let newStatus = "PENDING"
      if (paymentInfo.status === "approved") {
        newStatus = "APPROVED"
      } else if (paymentInfo.status === "rejected" || paymentInfo.status === "cancelled") {
        newStatus = "REJECTED"
      }

      await supabase
        .from("payments")
        .update({
          status: newStatus,
          metadata: {
            ...payment.metadata,
            payment_id: paymentId,
            payment_status: paymentInfo.status,
            status_detail: paymentInfo.status_detail,
          },
        })
        .eq("id", payment.id)

      // Se aprovado, ativar serviço
      if (newStatus === "APPROVED") {
        if (payment.type === "SUBSCRIPTION") {
          // Ativar assinatura Premium
          await supabase
            .from("lawyer_profiles")
            .update({
              subscription_status: "ACTIVE",
              is_premium: true,
              premium_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
            })
            .eq("id", payment.lawyer_id)
        } else if (payment.type === "BOOST") {
          // Ativar boost
          await supabase
            .from("lawyer_profiles")
            .update({
              boost_active: true,
              boost_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
            })
            .eq("id", payment.lawyer_id)
        }
      }

      return NextResponse.json({ received: true })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook error" }, { status: 500 })
  }
}
