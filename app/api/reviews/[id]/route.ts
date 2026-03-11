import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getAuthenticatedUserFromRequest } from "@/lib/auth/service"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const user = await getAuthenticatedUserFromRequest(request)

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const body = await request.json()
  const { lawyer_response } = body

  if (!lawyer_response || lawyer_response.trim().length < 10) {
    return NextResponse.json({ 
      error: "Resposta muito curta (mínimo 10 caracteres)" 
    }, { status: 400 })
  }

  // Verificar se a avaliação pertence ao advogado
  const { data: review } = await supabase
    .from("reviews")
    .select(`
      *,
      lawyer_profiles!inner(user_id)
    `)
    .eq("id", params.id)
    .single()

  if (!review) {
    return NextResponse.json({ error: "Avaliação não encontrada" }, { status: 404 })
  }

  // @ts-ignore
  if (review.lawyer_profiles.user_id !== user.id) {
    return NextResponse.json({ 
      error: "Você não pode responder esta avaliação" 
    }, { status: 403 })
  }

  // Atualizar resposta
  const { data: updated, error } = await supabase
    .from("reviews")
    .update({
      lawyer_response: lawyer_response.trim(),
      lawyer_responded_at: new Date().toISOString(),
    })
    .eq("id", params.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ review: updated })
}

// Denunciar avaliação
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const user = await getAuthenticatedUserFromRequest(request)

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  // Marcar como denunciada
  const { error } = await supabase
    .from("reviews")
    .update({ is_flagged: true })
    .eq("id", params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: "Avaliação denunciada com sucesso" })
}
