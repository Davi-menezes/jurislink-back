"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"

function VerifyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const verifyEmail = async () => {
      const supabase = createClient()
      
      // O Supabase automaticamente verifica o email via URL params
      // Apenas precisamos verificar se o usuário está autenticado
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        setStatus("error")
        setMessage("Link de verificação inválido ou expirado.")
        return
      }

      if (user.email_confirmed_at) {
        setStatus("success")
        setMessage("Email verificado com sucesso!")
        
        // Criar perfil se não existir
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .single()

        if (!profile) {
          // Criar perfil básico
          await supabase.from("profiles").insert({
            id: user.id,
            full_name: user.user_metadata?.full_name || "",
            role: user.user_metadata?.role || "CLIENT",
            lgpd_accepted: true,
            lgpd_accepted_at: new Date().toISOString(),
          })
        }

        // Redirecionar após 3 segundos
        setTimeout(() => {
          const role = user.user_metadata?.role || "CLIENT"
          if (role === "LAWYER") {
            router.push("/painel/advogado/perfil")
          } else {
            router.push("/painel/cliente")
          }
        }, 3000)
      } else {
        setStatus("error")
        setMessage("Erro ao verificar email. Tente novamente.")
      }
    }

    verifyEmail()
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {status === "loading" && (
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
            )}
            {status === "success" && (
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            )}
            {status === "error" && (
              <XCircle className="h-16 w-16 text-red-500" />
            )}
          </div>
          <CardTitle>
            {status === "loading" && "Verificando seu email..."}
            {status === "success" && "Email Verificado!"}
            {status === "error" && "Erro na Verificação"}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {status === "success" && (
            <p className="text-sm text-muted-foreground">
              Redirecionando para seu painel...
            </p>
          )}
          {status === "error" && (
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/auth/cadastro">Criar Nova Conta</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/auth/login">Fazer Login</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <VerifyContent />
    </Suspense>
  )
}
