"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Scale, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const normalizedEmail = email.trim().toLowerCase()
    let emailExists = false

    // Valida o estado do email antes do login quando o schema de profiles estiver disponível.
    const { data: profileByEmail, error: profileLookupError } = await supabase
      .from("profiles")
      .select("id, email_verified")
      .eq("email", normalizedEmail)
      .maybeSingle()

    if (!profileLookupError) {
      if (!profileByEmail) {
        toast.error("Email não cadastrado", {
          description: "Esse email não foi cadastrado. Crie sua conta para continuar.",
        })
        setLoading(false)
        return
      }

      emailExists = true

      if (profileByEmail.email_verified === false) {
        toast.error("Email não verificado", {
          description: "Seu email já existe, mas ainda não foi verificado. Verifique sua caixa de entrada e spam.",
        })
        setLoading(false)
        return
      }
    } else {
      console.warn("Não foi possível validar email em profiles:", profileLookupError.message)
    }

    const { error, data } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    })

    if (error) {
      toast.error("Erro ao entrar", {
        description: error.message === "Email not confirmed" 
          ? "Verifique seu email antes de fazer login. Cheque sua caixa de entrada e spam."
          : error.message === "Invalid login credentials"
          ? (emailExists ? "Senha incorreta. Tente novamente." : "Esse email não foi cadastrado.")
          : error.message,
      })
      setLoading(false)
      return
    }

    // Verificar se o email foi confirmado
    if (data.user && !data.user.email_confirmed_at) {
      toast.error("Email não verificado", {
        description: "Por favor, verifique seu email antes de fazer login. Cheque sua caixa de entrada e spam.",
      })
      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    // Buscar perfil e redirecionar
    const {
      data: { user },
    } = await supabase.auth.getUser()
    
    if (user) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle()

      if (profileError) {
        console.warn("Erro ao carregar role em profiles:", profileError.message)
      }

      const role = profile?.role || user.user_metadata?.role || "CLIENT"
      if (role === "LAWYER") router.push("/painel/advogado")
      else if (role === "ADMIN") router.push("/painel/admin")
      else router.push("/painel/cliente")
    }

    router.refresh()
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <div className="hidden w-full bg-primary lg:flex lg:w-1/2 lg:flex-col lg:items-center lg:justify-center">
        <Scale className="h-16 w-16 text-accent" />
        <h2 className="mt-4 font-serif text-3xl text-primary-foreground">JurisLink</h2>
        <p className="mt-2 max-w-sm text-center text-primary-foreground/70">
          Conectando você ao advogado ideal para o seu caso.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center lg:text-left">
            <Link href="/" className="mb-6 inline-flex items-center gap-2 lg:hidden">
              <Scale className="h-7 w-7 text-primary" />
              <span className="font-serif text-xl text-foreground">
                Juris<span className="text-accent">Link</span>
              </span>
            </Link>
            <h1 className="font-serif text-2xl text-foreground">Bem-vindo de volta</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Entre com suas credenciais para acessar sua conta
            </p>
          </div>

          {/* Login com Google removido - apenas email/senha */}
          {/* Para habilitar OAuth, configure no Supabase Dashboard → Authentication → Providers */}

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Ou entre com email
              </span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <Link href="/auth/esqueci-senha" className="text-xs text-primary hover:underline">
                  Esqueceu a senha?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" disabled={loading} className="mt-2">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Entrar
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Não tem uma conta?{" "}
            <Link href="/auth/cadastro" className="font-medium text-primary hover:underline">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
