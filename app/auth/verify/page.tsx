"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
      const token = searchParams.get("token")
      if (!token) {
        setStatus("error")
        setMessage("Link de verificação inválido ou expirado.")
        return
      }

      const response = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        setStatus("error")
        setMessage(payload?.error || "Erro ao verificar email. Tente novamente.")
        return
      }

      setStatus("success")
      setMessage("Email verificado com sucesso!")

      setTimeout(() => {
        router.push(payload?.redirectPath || "/painel/cliente")
        router.refresh()
      }, 3000)
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
