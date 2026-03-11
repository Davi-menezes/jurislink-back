import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedUserFromRequest } from "@/lib/auth/service"

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUserFromRequest(request)

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 })
  }

  return NextResponse.json({ user })
}
