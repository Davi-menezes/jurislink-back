import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getAuthenticatedUserFromRequest } from "@/lib/auth/service"

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 })
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Apenas administradores podem acessar." }, { status: 403 })
  }

  const supabase = await createClient()
  const [totalClientsResult, totalLawyersResult, pendingVerificationResult, flaggedReviewsResult, pendingLawyersResult, flaggedReviewsDataResult, recentPaymentsResult] =
    await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "CLIENT"),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "LAWYER"),
      supabase
        .from("lawyer_profiles")
        .select("*", { count: "exact", head: true })
        .eq("verification_status", "PENDING"),
      supabase
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .eq("is_flagged", true)
        .eq("is_hidden", false),
      supabase
        .from("lawyer_profiles")
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            email,
            avatar_url,
            created_at
          )
        `)
        .eq("verification_status", "PENDING")
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("reviews")
        .select(`
          *,
          client:client_id (
            id,
            full_name
          ),
          lawyer_profile:lawyer_id (
            id,
            profiles:user_id (
              full_name
            )
          )
        `)
        .eq("is_flagged", true)
        .eq("is_hidden", false)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("payments")
        .select(`
          *,
          lawyer_profile:lawyer_id (
            id,
            profiles:user_id (
              full_name
            )
          )
        `)
        .order("created_at", { ascending: false })
        .limit(10),
    ])

  const firstError =
    totalClientsResult.error ||
    totalLawyersResult.error ||
    pendingVerificationResult.error ||
    flaggedReviewsResult.error ||
    pendingLawyersResult.error ||
    flaggedReviewsDataResult.error ||
    recentPaymentsResult.error

  if (firstError) {
    return NextResponse.json({ error: firstError.message }, { status: 500 })
  }

  return NextResponse.json({
    profile: user.profile,
    totalClients: totalClientsResult.count || 0,
    totalLawyers: totalLawyersResult.count || 0,
    pendingVerification: pendingVerificationResult.count || 0,
    flaggedReviews: flaggedReviewsResult.count || 0,
    pendingLawyers: pendingLawyersResult.data || [],
    flaggedReviewsData: flaggedReviewsDataResult.data || [],
    recentPayments: recentPaymentsResult.data || [],
  })
}
