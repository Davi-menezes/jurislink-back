import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_APP_URL || "*",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() })
}

export async function POST(request: NextRequest) {
  const bearerToken = request.headers.get("authorization")?.replace("Bearer ", "")
  const supabase = await createClient()
  let user = null

  if (bearerToken) {
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    const { data } = await adminClient.auth.getUser(bearerToken)
    user = data.user
  }

  if (!user) {
    const {
      data: { user: cookieUser },
    } = await supabase.auth.getUser()
    user = cookieUser
  }

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401, headers: corsHeaders() })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return NextResponse.json({ error: "Arquivo não fornecido" }, { status: 400, headers: corsHeaders() })
    }

    // Validar tipo
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: "Tipo de arquivo não permitido. Use JPG, PNG ou WebP" 
      }, { status: 400, headers: corsHeaders() })
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ 
        error: "Arquivo muito grande. Máximo 5MB" 
      }, { status: 400, headers: corsHeaders() })
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: "SUPABASE_SERVICE_ROLE_KEY não configurada no backend." },
        { status: 500, headers: corsHeaders() },
      )
    }

    const storageClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
    )

    const extension = file.type.split("/")[1] || "jpg"
    const storagePath = `${user.id}/${Date.now()}.${extension}`
    const fileBuffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await storageClient.storage
      .from("avatars")
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      return NextResponse.json(
        { error: `Falha no upload: ${uploadError.message}` },
        { status: 500, headers: corsHeaders() },
      )
    }

    const { data: publicUrlData } = storageClient.storage
      .from("avatars")
      .getPublicUrl(storagePath)

    const avatarUrl = publicUrlData.publicUrl

    // Atualizar perfil (ou criar registro mínimo, se ainda não existir).
    await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          avatar_url: avatarUrl,
        },
        { onConflict: "id" },
      )

    return NextResponse.json({ url: avatarUrl }, { headers: corsHeaders() })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Erro ao fazer upload" }, { status: 500, headers: corsHeaders() })
  }
}
