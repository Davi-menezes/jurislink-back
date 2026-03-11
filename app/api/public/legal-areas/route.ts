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
  const { data, error } = await supabase
    .from("legal_areas")
    .select("id, name, slug, description, icon, is_active, updated_at")
    .eq("is_active", true)
    .order("name")

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders() })
  }

  return NextResponse.json({ areas: data || [] }, { headers: corsHeaders() })
}
