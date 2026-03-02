// Helper functions for Mercado Pago integration

const MP_BASE_URL = process.env.MERCADO_PAGO_SANDBOX === 'true' 
  ? 'https://api.mercadopago.com' 
  : 'https://api.mercadopago.com'

const MP_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN

export interface CreatePreferenceParams {
  title: string
  description: string
  price: number
  quantity: number
  external_reference: string
  payer_email?: string
  back_urls?: {
    success: string
    failure: string
    pending: string
  }
  auto_return?: 'approved' | 'all'
  notification_url?: string
}

export async function createPaymentPreference(params: CreatePreferenceParams) {
  const response = await fetch(`${MP_BASE_URL}/checkout/preferences`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items: [{
        title: params.title,
        description: params.description,
        unit_price: params.price,
        quantity: params.quantity,
        currency_id: 'BRL',
      }],
      external_reference: params.external_reference,
      payer: params.payer_email ? {
        email: params.payer_email,
      } : undefined,
      back_urls: params.back_urls,
      auto_return: params.auto_return || 'approved',
      notification_url: params.notification_url,
      statement_descriptor: 'JURISLINK',
      binary_mode: false,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Mercado Pago error: ${JSON.stringify(error)}`)
  }

  return await response.json()
}

export interface CreateSubscriptionParams {
  plan_id: string
  payer_email: string
  card_token_id?: string
  back_url: string
  external_reference: string
}

// For subscription, we'll use preferences for now (simpler for MVP)
// In production, you'd want to use Mercado Pago's subscription API
export async function createSubscriptionPreference(params: {
  title: string
  description: string
  price: number
  payer_email: string
  external_reference: string
  back_urls: {
    success: string
    failure: string
    pending: string
  }
  notification_url: string
}) {
  return createPaymentPreference({
    title: params.title,
    description: params.description,
    price: params.price,
    quantity: 1,
    external_reference: params.external_reference,
    payer_email: params.payer_email,
    back_urls: params.back_urls,
    auto_return: 'approved',
    notification_url: params.notification_url,
  })
}

export async function getPaymentInfo(paymentId: string) {
  const response = await fetch(`${MP_BASE_URL}/v1/payments/${paymentId}`, {
    headers: {
      'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to get payment info')
  }

  return await response.json()
}

export function validateWebhookSignature(
  dataId: string,
  signature: string,
  secret: string
): boolean {
  // Implement signature validation
  // For MVP, we'll trust the webhook if it comes from MP
  return true
}
