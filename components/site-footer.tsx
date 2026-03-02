import Link from "next/link"
import { Scale } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Scale className="h-6 w-6 text-primary" />
              <span className="font-serif text-lg text-foreground">
                Juris<span className="text-accent">Link</span>
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Conectando voce ao advogado ideal. Plataforma brasileira de servicos juridicos.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Para Clientes</h3>
            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/buscar" className="text-sm text-muted-foreground hover:text-foreground">
                  Buscar Advogados
                </Link>
              </li>
              <li>
                <Link href="/areas" className="text-sm text-muted-foreground hover:text-foreground">
                  Areas do Direito
                </Link>
              </li>
              <li>
                <Link href="/como-funciona" className="text-sm text-muted-foreground hover:text-foreground">
                  Como Funciona
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Para Advogados</h3>
            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/auth/cadastro?role=LAWYER" className="text-sm text-muted-foreground hover:text-foreground">
                  Cadastre-se
                </Link>
              </li>
              <li>
                <Link href="/planos" className="text-sm text-muted-foreground hover:text-foreground">
                  Planos e Precos
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Legal</h3>
            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/termos" className="text-sm text-muted-foreground hover:text-foreground">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link href="/privacidade" className="text-sm text-muted-foreground hover:text-foreground">
                  Politica de Privacidade
                </Link>
              </li>
              <li>
                <Link href="/lgpd" className="text-sm text-muted-foreground hover:text-foreground">
                  LGPD
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          <p>JurisLink - Todos os direitos reservados. Este site nao presta consultoria juridica.</p>
        </div>
      </div>
    </footer>
  )
}
