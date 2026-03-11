import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": process.env.FRONTEND_URL || "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() })
}

type Params = {
  params: Promise<{ slug: string }>
}

export async function GET(_request: NextRequest, { params }: Params) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: lawyer, error: lawyerError } = await supabase
    .from("lawyer_profiles")
    .select(
      `
      *,
      profiles:user_id (
        id,
        full_name,
        avatar_url,
        state,
        city,
        phone
      ),
      lawyer_legal_areas(
        legal_areas(
          id,
          name,
          slug,
          icon
        )
      )
    `
    )
    .eq("slug", slug)
    .eq("is_approved", true)
    .single()

  if (lawyerError || !lawyer) {
    return NextResponse.json({ error: "Advogado não encontrado." }, { status: 404, headers: corsHeaders() })
  }

  await supabase
    .from("lawyer_profiles")
    .update({ total_views: (lawyer.total_views || 0) + 1 })
    .eq("id", lawyer.id)

  const { data: reviews, error: reviewsError } = await supabase
    .from("reviews")
    .select(
      `
      *,
      profiles:client_id (
        id,
        full_name,
        avatar_url
      )
    `
    )
    .eq("lawyer_id", lawyer.id)
    .eq("is_hidden", false)
    .order("created_at", { ascending: false })

  if (reviewsError) {
    return NextResponse.json({ error: reviewsError.message }, { status: 500, headers: corsHeaders() })
  }

  return NextResponse.json({ lawyer, reviews: reviews || [] }, { headers: corsHeaders() })
}
