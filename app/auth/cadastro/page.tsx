"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, Suspense } from "react"
import { Scale, Loader2, User, Briefcase } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import type { UserRole } from "@/lib/types"

function SignUpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialRole = (searchParams.get("role") as UserRole) || "CLIENT"

  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState<UserRole>(initialRole)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [lgpdAccepted, setLgpdAccepted] = useState(false)

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
    const supabase = createClient()

    // Verificar se o usuário já existe
    const normalizedEmail = email.trim().toLowerCase()
    const { data: existingUser, error: profileLookupError } = await supabase
      .from("profiles")
      .select("id, email_verified")
      .eq("email", normalizedEmail)
      .maybeSingle()

    if (profileLookupError) {
      console.warn("Não foi possível verificar email em profiles:", profileLookupError.message)
    }

    if (existingUser) {
      if (!existingUser.email_verified) {
        await supabase.auth.resend({
          type: "signup",
          email: normalizedEmail,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        toast.info("Email de verificação já enviado", {
          description: "Seu cadastro já existe, mas não foi confirmado. Reenviamos o link de verificação para sua caixa de entrada e spam.",
        })
        setLoading(false)
        return
      } else {
        toast.error("Email já cadastrado", {
          description: "Este email já está em uso. Faça login ou use outro email.",
        })
        setLoading(false)
        return
      }
    }

    const { error, data } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: fullName,
          role,
        },
      },
    })

    if (error) {
      toast.error("Erro ao criar conta", {
        description: error.message,
      })
      setLoading(false)
      return
    }

    // Verificar se precisa confirmar email
    if (data.user && !data.user.confirmed_at) {
      toast.success("Conta criada!", {
        description: "Verifique seu email para ativar sua conta.",
      })
      router.push("/auth/cadastro-sucesso")
    } else {
      router.push("/auth/callback")
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true)
    const supabase = createClient()
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) {
      console.error('OAuth Error:', error)
      toast.error("Erro ao conectar com Google", {
        description: error.message === "Unsupported provider: provider is not enabled"
          ? "O login com Google ainda não está configurado. Use email e senha."
          : error.message,
      })
      setLoading(false)
      return
    }
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

          {/* OAuth Google */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full"
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
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
            <Button type="submit" disabled={loading} className="mt-2">
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
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  )
}
