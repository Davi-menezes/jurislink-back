import Link from "next/link"
import { Scale, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        <Link href="/" className="mb-8 inline-flex items-center gap-2">
          <Scale className="h-7 w-7 text-primary" />
          <span className="font-serif text-xl text-foreground">
            Juris<span className="text-accent">Link</span>
          </span>
        </Link>
        <div className="mt-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
        </div>
        <h1 className="mt-6 font-serif text-2xl text-foreground">
          Erro de Autenticacao
        </h1>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Ocorreu um erro durante a autenticacao. O link pode ter expirado ou
          ja foi utilizado. Tente novamente.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/">Voltar ao Inicio</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/login">Tentar Novamente</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
