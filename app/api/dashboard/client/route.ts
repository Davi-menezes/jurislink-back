import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getAuthenticatedUserFromRequest } from "@/lib/auth/service"

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 })
  }

  if (user.role !== "CLIENT") {
    return NextResponse.json({ error: "Apenas clientes podem acessar." }, { status: 403 })
  }

  const supabase = await createClient()
  const [favoritesResult, reviewsResult] = await Promise.all([
    supabase
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
      .order("created_at", { ascending: false }),
    supabase
      .from("reviews")
      .select(`
        id,
        rating,
        comment,
        lawyer_response,
        created_at,
        lawyer_profiles:lawyer_id (
          id,
          slug,
          profiles:user_id (
            full_name,
            avatar_url
          )
        )
      `)
      .eq("client_id", user.id)
      .order("created_at", { ascending: false }),
  ])

  if (favoritesResult.error) {
    return NextResponse.json({ error: favoritesResult.error.message }, { status: 500 })
  }

  if (reviewsResult.error) {
    return NextResponse.json({ error: reviewsResult.error.message }, { status: 500 })
  }

  return NextResponse.json({
    profile: user.profile,
    favorites: favoritesResult.data || [],
    reviews: reviewsResult.data || [],
  })
}
