import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getAuthenticatedUserFromRequest } from "@/lib/auth/service"

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 })
  }

  if (user.role !== "LAWYER") {
    return NextResponse.json({ error: "Apenas advogados podem acessar." }, { status: 403 })
  }

  const supabase = await createClient()
  const { data: lawyerProfile, error: lawyerProfileError } = await supabase
    .from("lawyer_profiles")
    .select(`
      *,
      lawyer_legal_areas(legal_areas(id, name, slug, icon))
    `)
    .eq("user_id", user.id)
    .single()

  if (lawyerProfileError) {
    return NextResponse.json({ error: lawyerProfileError.message }, { status: 500 })
  }

  const [contactsResult, reviewsResult] = await Promise.all([
    supabase
      .from("contacts")
      .select("*")
      .eq("lawyer_id", lawyerProfile.id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("reviews")
      .select(`
        *,
        profiles:client_id (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq("lawyer_id", lawyerProfile.id)
      .eq("is_hidden", false)
      .order("created_at", { ascending: false }),
  ])

  if (contactsResult.error) {
    return NextResponse.json({ error: contactsResult.error.message }, { status: 500 })
  }

  if (reviewsResult.error) {
    return NextResponse.json({ error: reviewsResult.error.message }, { status: 500 })
  }

  return NextResponse.json({
    profile: user.profile,
    lawyerProfile,
    contacts: contactsResult.data || [],
    reviews: reviewsResult.data || [],
  })
}
