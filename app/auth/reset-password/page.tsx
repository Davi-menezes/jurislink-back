"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2, Lock, Eye, EyeOff } from "lucide-react"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    
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
        description: "A senha deve conter pelo menos um caractere especial.",
      })
      return
    }

    if (password !== confirmPassword) {
      toast.error("Senhas não coincidem", {
        description: "As senhas digitadas são diferentes.",
      })
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({
      password: password,
    })

    if (error) {
      toast.error("Erro ao redefinir senha", {
        description: error.message,
      })
      setLoading(false)
      return
    }

    toast.success("Senha redefinida!", {
      description: "Você já pode fazer login com a nova senha.",
    })

    setTimeout(() => {
      router.push("/auth/login")
    }, 2000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-center">Redefinir Senha</CardTitle>
          <CardDescription className="text-center">
            Digite sua nova senha abaixo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Digite a senha novamente"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                disabled={loading}
              />
            </div>

            <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
              <p className="font-medium mb-1">Sua senha deve conter:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Pelo menos 8 caracteres</li>
                <li>Letras maiúsculas e minúsculas</li>
                <li>Números</li>
                <li>Caracteres especiais (!@#$%^&*)</li>
              </ul>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Redefinir Senha
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
