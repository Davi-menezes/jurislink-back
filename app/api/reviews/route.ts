import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET - Listar avaliações de um advogado
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lawyerId = searchParams.get("lawyer_id")

  if (!lawyerId) {
    return NextResponse.json({ error: "lawyer_id é obrigatório" }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: reviews, error } = await supabase
    .from("reviews")
    .select(`
      *,
      profiles:client_id (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq("lawyer_id", lawyerId)
    .eq("is_hidden", false)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ reviews })
}

// POST - Criar nova avaliação
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  // Verificar se é cliente
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "CLIENT") {
    return NextResponse.json({ error: "Apenas clientes podem avaliar" }, { status: 403 })
  }

  const body = await request.json()
  const { lawyer_id, rating, comment, title, is_anonymous } = body

  // Validações
  if (!lawyer_id || !rating || !comment) {
    return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 })
  }

  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Nota deve ser entre 1 e 5" }, { status: 400 })
  }

  if (comment.length < 10) {
    return NextResponse.json({ error: "Comentário muito curto (mínimo 10 caracteres)" }, { status: 400 })
  }

  // Filtro de palavras ofensivas (básico)
  const offensiveWords = ["idiota", "burro", "incompetente", "lixo", "merda"]
  const hasOffensive = offensiveWords.some(word => 
    comment.toLowerCase().includes(word)
  )

  if (hasOffensive) {
    return NextResponse.json({ 
      error: "Comentário contém linguagem inadequada" 
    }, { status: 400 })
  }

  // Verificar se já avaliou
  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("lawyer_id", lawyer_id)
    .eq("client_id", user.id)
    .single()

  if (existing) {
    return NextResponse.json({ 
      error: "Você já avaliou este advogado" 
    }, { status: 400 })
  }

  // Criar avaliação
  const { data: review, error: createError } = await supabase
    .from("reviews")
    .insert({
      lawyer_id,
      client_id: user.id,
      rating,
      comment: comment.trim(),
      title: title?.trim() || null,
      is_anonymous: is_anonymous || false,
    })
    .select()
    .single()

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 500 })
  }

  // Atualizar média do advogado (trigger já deve fazer isso, mas podemos fazer manualmente)
  const { data: allReviews } = await supabase
    .from("reviews")
    .select("rating")
    .eq("lawyer_id", lawyer_id)
    .eq("is_hidden", false)

  if (allReviews) {
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
    const ratingCount = allReviews.length

    await supabase
      .from("lawyer_profiles")
      .update({
        avg_rating: avgRating,
        total_reviews: ratingCount,
      })
      .eq("id", lawyer_id)
  }

  return NextResponse.json({ review }, { status: 201 })
}
