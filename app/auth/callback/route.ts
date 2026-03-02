import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next")
  const safeNext = next && next.startsWith("/") ? next : null

  if (code) {
    const supabase = await createClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // Verificar se já tem perfil
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", data.user.id)
        .maybeSingle()

      if (profileError) {
        console.warn("Erro ao buscar perfil no callback:", profileError.message)
      }

      // Se não tem perfil, criar um (OAuth ou verificação)
      if (!profile) {
        const role = data.user.user_metadata?.role || "CLIENT"
        const fullName = 
          data.user.user_metadata?.full_name || 
          data.user.user_metadata?.name || 
          data.user.user_metadata?.full_name ||
          data.user.email?.split("@")[0] || 
          "Usuário"

        await supabase.from("profiles").insert({
          id: data.user.id,
          full_name: fullName,
          role,
          lgpd_accepted: true,
          lgpd_accepted_at: new Date().toISOString(),
        })

        if (safeNext) {
          return NextResponse.redirect(`${origin}${safeNext}`)
        }

        // Redirecionar baseado no role
        if (role === "LAWYER") {
          return NextResponse.redirect(`${origin}/painel/advogado/perfil`)
        } else {
          return NextResponse.redirect(`${origin}/painel/cliente`)
        }
      }

      if (safeNext) {
        return NextResponse.redirect(`${origin}${safeNext}`)
      }

      // Se já tem perfil, redirecionar baseado no role
      const userRole = profile?.role || data.user.user_metadata?.role || "CLIENT"
      if (userRole === "LAWYER") {
        return NextResponse.redirect(`${origin}/painel/advogado`)
      } else if (userRole === "ADMIN") {
        return NextResponse.redirect(`${origin}/painel/admin`)
      } else {
        return NextResponse.redirect(`${origin}/painel/cliente`)
      }
    }
  }

  // Se deu erro, redireciona pro erro
  return NextResponse.redirect(`${origin}/auth/error`)
}
