import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        <Link href="/" className="mb-8 inline-flex items-center gap-2">
          <span className="font-serif text-xl text-foreground">Juris<span className="text-accent">Link</span></span>
        </Link>
        <div className="mt-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl">📧</div>
        </div>
        <h1 className="mt-6 font-serif text-2xl text-foreground">
          Verifique seu Email
        </h1>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Enviamos um link de confirmacao para o seu email. Clique no link
          para ativar sua conta e comecar a usar o JurisLink.
        </p>
        <Link
          href="/auth/login"
          className="mt-8 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Ir para o Login
        </Link>
      </div>
    </div>
  )
}
