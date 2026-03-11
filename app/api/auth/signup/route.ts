import { NextRequest, NextResponse } from "next/server"
import { registerUser } from "@/lib/auth/service"
import type { UserRole } from "@/lib/types"

type Body = {
  fullName?: string
  email?: string
  password?: string
  role?: UserRole
  lgpdAccepted?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Body
    const result = await registerUser({
      fullName: body.fullName?.trim() || "",
      email: body.email?.trim() || "",
      password: body.password || "",
      role: body.role ?? "CLIENT",
      lgpdAccepted: body.lgpdAccepted === true,
    })

    return NextResponse.json({
      success: true,
      status: result.status,
      message: result.message,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível criar sua conta.",
      },
      { status: 400 },
    )
  }
}
