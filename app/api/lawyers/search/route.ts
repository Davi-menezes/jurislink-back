import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCached, setCache } from "@/lib/redis"

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_APP_URL || "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() })
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q") || ""
  const area = searchParams.get("area") || ""
  const state = searchParams.get("estado") || ""
  const city = searchParams.get("cidade") || ""
  const minRating = Number(searchParams.get("min_rating") || 0)
  const acceptsOnline = searchParams.get("online") === "true"
  const sortBy = searchParams.get("sort") || "relevance"
  const page = Math.max(1, Number(searchParams.get("page") || 1))
  const perPage = Math.min(50, Math.max(1, Number(searchParams.get("per_page") || 12)))
  const offset = (page - 1) * perPage

  // Try cache
  const cacheKey = `search:${JSON.stringify({ query, area, state, city, minRating, acceptsOnline, sortBy, page, perPage })}`
  const cached = await getCached<{ lawyers: unknown[]; total: number }>(cacheKey)
  if (cached) {
    return NextResponse.json(cached, { headers: corsHeaders() })
  }

  const supabase = await createClient()

  let dbQuery = supabase
    .from("lawyer_profiles")
    .select(
      `
      *,
      profiles!inner(id, full_name, avatar_url, state, city),
      lawyer_legal_areas(legal_areas(id, name, slug, icon))
    `,
      { count: "exact" }
    )
    .eq("is_approved", true)

  // Text search on name, headline, bio
  if (query) {
    dbQuery = dbQuery.or(
      `headline.ilike.%${query}%,bio.ilike.%${query}%,profiles.full_name.ilike.%${query}%`
    )
  }

  // Filter by state
  if (state) {
    dbQuery = dbQuery.eq("profiles.state", state)
  }

  // Filter by city
  if (city) {
    dbQuery = dbQuery.ilike("profiles.city", `%${city}%`)
  }

  // Filter by min rating
  if (minRating > 0) {
    dbQuery = dbQuery.gte("avg_rating", minRating)
  }

  // Filter online
  if (acceptsOnline) {
    dbQuery = dbQuery.eq("accepts_online", true)
  }

  // Sorting
  switch (sortBy) {
    case "rating":
      dbQuery = dbQuery.order("avg_rating", { ascending: false })
      break
    case "reviews":
      dbQuery = dbQuery.order("total_reviews", { ascending: false })
      break
    case "price_low":
      dbQuery = dbQuery.order("hourly_rate_min", { ascending: true, nullsFirst: false })
      break
    case "price_high":
      dbQuery = dbQuery.order("hourly_rate_max", { ascending: false })
      break
    default:
      // Relevance: boost premium + boosted, then by rating
      dbQuery = dbQuery
        .order("boost_active", { ascending: false })
        .order("is_premium", { ascending: false })
        .order("avg_rating", { ascending: false })
  }

  dbQuery = dbQuery.range(offset, offset + perPage - 1)

  const { data: lawyers, count, error } = await dbQuery

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders() })
  }

  // Filter by area post-query (junction table filtering)
  let filteredLawyers = lawyers || []
  if (area) {
    filteredLawyers = filteredLawyers.filter((l: Record<string, unknown>) =>
      (l.lawyer_legal_areas as { legal_areas: { slug: string } }[])?.some(
        (lla) => lla.legal_areas?.slug === area
      )
    )
  }

  const result = { lawyers: filteredLawyers, total: count || 0, page, perPage }

  // Cache for 5 minutes
  await setCache(cacheKey, result, 300)

  return NextResponse.json(result, { headers: corsHeaders() })
}
