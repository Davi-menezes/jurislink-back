import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// POST - Enviar mensagem de contato
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  const body = await request.json()
  const { lawyer_id, client_name, client_email, client_phone, message } = body

  // Validações
  if (!lawyer_id || !client_name || !client_email || !message) {
    return NextResponse.json({ 
      error: "Campos obrigatórios faltando" 
    }, { status: 400 })
  }

  if (message.length < 20) {
    return NextResponse.json({ 
      error: "Mensagem muito curta (mínimo 20 caracteres)" 
    }, { status: 400 })
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(client_email)) {
    return NextResponse.json({ 
      error: "Email inválido" 
    }, { status: 400 })
  }

  // Verificar se o advogado existe
  const { data: lawyer } = await supabase
    .from("lawyer_profiles")
    .select("id")
    .eq("id", lawyer_id)
    .single()

  if (!lawyer) {
    return NextResponse.json({ 
      error: "Advogado não encontrado" 
    }, { status: 404 })
  }

  // Criar contato
  const { data: contact, error } = await supabase
    .from("contacts")
    .insert({
      lawyer_id,
      client_name: client_name.trim(),
      client_email: client_email.trim().toLowerCase(),
      client_phone: client_phone?.trim() || null,
      message: message.trim(),
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // TODO: Enviar email para o advogado notificando sobre o lead

  return NextResponse.json({ 
    message: "Mensagem enviada com sucesso",
    contact 
  }, { status: 201 })
}

// GET - Listar contatos (apenas para o advogado)
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  // Buscar perfil do advogado
  const { data: lawyerProfile } = await supabase
    .from("lawyer_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (!lawyerProfile) {
    return NextResponse.json({ 
      error: "Apenas advogados podem acessar" 
    }, { status: 403 })
  }

  // Buscar contatos
  const { data: contacts, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("lawyer_id", lawyerProfile.id)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ contacts })
}
