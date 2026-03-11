import { NextResponse } from "next/server"
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

export async function GET() {
  const supabase = await createClient()

  const [{ data: areas, error: areasError }, { data: lawyers, error: lawyersError }] = await Promise.all([
    supabase
      .from("legal_areas")
      .select("slug, updated_at")
      .eq("is_active", true),
    supabase
      .from("lawyer_profiles")
      .select("slug, updated_at")
      .eq("is_approved", true)
      .not("slug", "is", null)
      .limit(5000),
  ])

  if (areasError || lawyersError) {
    return NextResponse.json(
      { error: areasError?.message || lawyersError?.message || "Falha ao carregar sitemap." },
      { status: 500, headers: corsHeaders() }
    )
  }

  return NextResponse.json(
    {
      areas: areas || [],
      lawyers: lawyers || [],
    },
    { headers: corsHeaders() }
  )
}
