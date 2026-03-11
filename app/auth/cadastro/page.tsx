"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Scale, Loader2, User, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import type { UserRole } from "@/lib/types"

function SignUpForm() {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState<UserRole>("CLIENT")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [lgpdAccepted, setLgpdAccepted] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const queryRole = params.get("role")
    if (queryRole === "LAWYER" || queryRole === "CLIENT") {
      setRole(queryRole)
    }
  }, [])

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()

    if (!lgpdAccepted) {
      toast.error("Aceite os termos", {
        description: "Você precisa aceitar os termos de uso e a política de privacidade.",
      })
      return
    }

    // Validação de senha forte
    if (password.length < 8) {
      toast.error("Senha muito curta", {
        description: "A senha deve ter pelo menos 8 caracteres.",
      })
      return
    }

    if (!/[A-Z]/.test(password)) {
      toast.error("Senha fraca", {
        description: "A senha deve conter pelo menos uma letra maiúscula.",
      })
      return
    }

    if (!/[a-z]/.test(password)) {
      toast.error("Senha fraca", {
        description: "A senha deve conter pelo menos uma letra minúscula.",
      })
      return
    }

    if (!/[0-9]/.test(password)) {
      toast.error("Senha fraca", {
        description: "A senha deve conter pelo menos um número.",
      })
      return
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      toast.error("Senha fraca", {
        description: "A senha deve conter pelo menos um caractere especial (!@#$%^&* etc).",
      })
      return
    }

    setLoading(true)
    const normalizedEmail = email.trim().toLowerCase()

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName,
        email: normalizedEmail,
        password,
        role,
        lgpdAccepted,
      }),
    })

    const body = await response.json().catch(() => null)

    if (!response.ok) {
      toast.error("Erro ao criar conta", {
        description: body?.error || "Não foi possível criar a conta.",
      })
      setLoading(false)
      return
    }

    toast.success(body?.status === "verification_resent" ? "Verificação reenviada!" : "Conta criada!", {
      description:
        body?.message || "Verifique seu email para ativar sua conta.",
    })
    router.push("/auth/cadastro-sucesso")
  }

  function handleGoogleSignUp() {
    setGoogleLoading(true)
    window.location.href = `/api/auth/google?role=${role}`
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <div className="hidden w-full bg-primary lg:flex lg:w-1/2 lg:flex-col lg:items-center lg:justify-center">
        <Scale className="h-16 w-16 text-accent" />
        <h2 className="mt-4 font-serif text-3xl text-primary-foreground">JurisLink</h2>
        <p className="mt-2 max-w-sm text-center text-primary-foreground/70">
          {role === "LAWYER"
            ? "Aumente sua visibilidade e receba novos clientes."
            : "Encontre o advogado ideal para o seu caso."}
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-6 text-center lg:text-left">
            <Link href="/" className="mb-6 inline-flex items-center gap-2 lg:hidden">
              <Scale className="h-7 w-7 text-primary" />
              <span className="font-serif text-xl text-foreground">
                Juris<span className="text-accent">Link</span>
              </span>
            </Link>
            <h1 className="font-serif text-2xl text-foreground">Criar Conta</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Preencha os dados abaixo para começar
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={loading || googleLoading}
            onClick={handleGoogleSignUp}
          >
            {googleLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continuar com Google
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Ou cadastre-se com email
              </span>
            </div>
          </div>

          {/* Role selector */}
          <div className="mb-6 flex gap-3">
            <button
              type="button"
              onClick={() => setRole("CLIENT")}
              className={`flex flex-1 flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                role === "CLIENT"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/30"
              }`}
            >
              <User className="h-5 w-5" />
              <span className="text-sm font-medium">Sou Cliente</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("LAWYER")}
              className={`flex flex-1 flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                role === "LAWYER"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/30"
              }`}
            >
              <Briefcase className="h-5 w-5" />
              <span className="text-sm font-medium">Sou Advogado</span>
            </button>
          </div>

          <form onSubmit={handleSignUp} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input
                id="fullName"
                placeholder="Seu nome completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 8 caracteres (A-Z, a-z, 0-9, !@#$)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use letras maiúsculas, minúsculas, números e caracteres especiais
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox
                id="lgpd"
                checked={lgpdAccepted}
                onCheckedChange={(c) => setLgpdAccepted(c === true)}
              />
              <Label htmlFor="lgpd" className="text-xs leading-relaxed text-muted-foreground">
                Li e aceito os{" "}
                <Link href="/termos" className="text-primary hover:underline">
                  Termos de Uso
                </Link>{" "}
                e a{" "}
                <Link href="/privacidade" className="text-primary hover:underline">
                  Política de Privacidade
                </Link>
                , conforme a LGPD.
              </Label>
            </div>
            <Button type="submit" disabled={loading || googleLoading} className="mt-2">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Conta
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Link href="/auth/login" className="font-medium text-primary hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return <SignUpForm />
}
