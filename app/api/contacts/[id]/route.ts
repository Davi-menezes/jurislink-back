import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  // Verificar se o contato pertence ao advogado
  const { data: contact } = await supabase
    .from("contacts")
    .select(`
      *,
      lawyer_profiles!inner(user_id)
    `)
    .eq("id", params.id)
    .single()

  if (!contact) {
    return NextResponse.json({ error: "Contato não encontrado" }, { status: 404 })
  }

  // @ts-ignore
  if (contact.lawyer_profiles.user_id !== user.id) {
    return NextResponse.json({ 
      error: "Você não pode acessar este contato" 
    }, { status: 403 })
  }

  // Marcar como lido
  const { error } = await supabase
    .from("contacts")
    .update({ is_read: true })
    .eq("id", params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: "Contato marcado como lido" })
}
