"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Scale, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const normalizedEmail = email.trim().toLowerCase()
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: normalizedEmail,
        password,
      }),
    })

    const payload = await response.json().catch(() => null)

    if (!response.ok) {
      toast.error("Erro ao entrar", {
        description: payload?.error || "Não foi possível realizar seu login.",
      })
      setLoading(false)
      return
    }

    const next = new URLSearchParams(window.location.search).get("next")
    const redirectPath =
      next && next.startsWith("/") ? next : payload?.redirectPath || "/painel/cliente"
    router.push(redirectPath)
    router.refresh()
    setLoading(false)
  }

  function handleGoogleLogin() {
    setGoogleLoading(true)
    const next = new URLSearchParams(window.location.search).get("next")
    const url = next
      ? `/api/auth/google?next=${encodeURIComponent(next)}`
      : "/api/auth/google"

    window.location.href = url
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

          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={googleLoading || loading}
            onClick={handleGoogleLogin}
          >
            {googleLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Entrar com Google
          </Button>

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
                disabled={loading || googleLoading}
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
                disabled={loading || googleLoading}
              />
            </div>
            <Button type="submit" disabled={loading || googleLoading} className="mt-2">
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
