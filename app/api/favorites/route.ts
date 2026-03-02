import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET - Listar favoritos do usuário
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const { data: favorites, error } = await supabase
    .from("favorites")
    .select(`
      id,
      created_at,
      lawyer_profiles:lawyer_id (
        id,
        slug,
        oab_number,
        oab_state,
        avg_rating,
        total_reviews,
        profiles:user_id (
          id,
          full_name,
          avatar_url,
          state,
          city
        )
      )
    `)
    .eq("client_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ favorites })
}

// POST - Adicionar favorito
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const body = await request.json()
  const { lawyer_id } = body

  if (!lawyer_id) {
    return NextResponse.json({ error: "lawyer_id é obrigatório" }, { status: 400 })
  }

  // Verificar se já está nos favoritos
  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("client_id", user.id)
    .eq("lawyer_id", lawyer_id)
    .single()

  if (existing) {
    return NextResponse.json({ 
      error: "Advogado já está nos favoritos" 
    }, { status: 400 })
  }

  // Adicionar aos favoritos
  const { data: favorite, error } = await supabase
    .from("favorites")
    .insert({
      client_id: user.id,
      lawyer_id,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ favorite }, { status: 201 })
}

// DELETE - Remover favorito
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const lawyer_id = searchParams.get("lawyer_id")

  if (!lawyer_id) {
    return NextResponse.json({ error: "lawyer_id é obrigatório" }, { status: 400 })
  }

  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("client_id", user.id)
    .eq("lawyer_id", lawyer_id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: "Favorito removido com sucesso" })
}
