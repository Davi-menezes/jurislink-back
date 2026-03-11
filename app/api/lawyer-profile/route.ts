import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedUserFromRequest } from "@/lib/auth/service"
import { createClient } from "@/lib/supabase/server"
import { createSlug } from "@/lib/security"

type Body = {
  oab_number?: string
  oab_state?: string
  state?: string
  city?: string
  serves_entire_state?: boolean
  years_experience?: number
  headline?: string
  bio?: string
  education?: string
  phone?: string
  website?: string
  linkedin?: string
  hourly_rate_min?: string | null
  hourly_rate_max?: string | null
  accepts_online?: boolean
  accepts_in_person?: boolean
  office_address?: string
  selected_areas?: string[]
}

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 })
  }

  if (user.role !== "LAWYER") {
    return NextResponse.json({ error: "Apenas advogados podem acessar." }, { status: 403 })
  }

  const supabase = await createClient()

  const [{ data: legalAreas, error: legalAreasError }, { data: profile, error: profileError }, { data: lawyerProfile, error: lawyerProfileError }] =
    await Promise.all([
      supabase.from("legal_areas").select("*").eq("is_active", true).order("name"),
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase
        .from("lawyer_profiles")
        .select(`
          *,
          lawyer_legal_areas(area_id)
        `)
        .eq("user_id", user.id)
        .maybeSingle(),
    ])

  const error = legalAreasError || profileError || lawyerProfileError
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    legalAreas: legalAreas || [],
    profile,
    lawyerProfile,
  })
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 })
  }

  if (user.role !== "LAWYER") {
    return NextResponse.json({ error: "Apenas advogados podem salvar esse perfil." }, { status: 403 })
  }

  const body = (await request.json()) as Body
  const supabase = await createClient()

  const { error: profileUpdateError } = await supabase
    .from("profiles")
    .update({
      state: body.state || null,
      city: body.city || null,
      phone: body.phone || null,
    })
    .eq("id", user.id)

  if (profileUpdateError) {
    return NextResponse.json({ error: profileUpdateError.message }, { status: 500 })
  }

  const slug = `${createSlug(user.fullName || "advogado")}-${body.oab_number || ""}-${body.oab_state || ""}`
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "")

  const { data: existingLawyer, error: existingLawyerError } = await supabase
    .from("lawyer_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (existingLawyerError) {
    return NextResponse.json({ error: existingLawyerError.message }, { status: 500 })
  }

  const lawyerPayload = {
    oab_number: body.oab_number || "",
    oab_state: body.oab_state || "",
    state: body.state || "",
    city: body.city || "",
    serves_entire_state: body.serves_entire_state === true,
    years_experience: Number(body.years_experience || 0),
    headline: body.headline || null,
    bio: body.bio || null,
    education: body.education || null,
    website: body.website || null,
    linkedin: body.linkedin || null,
    hourly_rate_min: body.hourly_rate_min ? Number(body.hourly_rate_min) : null,
    hourly_rate_max: body.hourly_rate_max ? Number(body.hourly_rate_max) : null,
    accepts_online: body.accepts_online !== false,
    accepts_in_person: body.accepts_in_person !== false,
    office_address: body.office_address || null,
    slug,
  }

  let lawyerId = existingLawyer?.id as string | undefined

  if (existingLawyer) {
    const { error: lawyerUpdateError } = await supabase
      .from("lawyer_profiles")
      .update(lawyerPayload)
      .eq("id", existingLawyer.id)

    if (lawyerUpdateError) {
      return NextResponse.json({ error: lawyerUpdateError.message }, { status: 500 })
    }
  } else {
    const { data: createdLawyer, error: lawyerCreateError } = await supabase
      .from("lawyer_profiles")
      .insert({
        user_id: user.id,
        ...lawyerPayload,
      })
      .select("id")
      .single()

    if (lawyerCreateError) {
      return NextResponse.json({ error: lawyerCreateError.message }, { status: 500 })
    }

    lawyerId = createdLawyer.id
  }

  if (!lawyerId) {
    return NextResponse.json({ error: "Não foi possível salvar o perfil." }, { status: 500 })
  }

  const { error: deleteAreasError } = await supabase
    .from("lawyer_legal_areas")
    .delete()
    .eq("lawyer_id", lawyerId)

  if (deleteAreasError) {
    return NextResponse.json({ error: deleteAreasError.message }, { status: 500 })
  }

  const selectedAreas = Array.isArray(body.selected_areas) ? body.selected_areas : []
  if (selectedAreas.length > 0) {
    const { error: insertAreasError } = await supabase
      .from("lawyer_legal_areas")
      .insert(
        selectedAreas.map((areaId) => ({
          lawyer_id: lawyerId,
          area_id: areaId,
        })),
      )

    if (insertAreasError) {
      return NextResponse.json({ error: insertAreasError.message }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}
