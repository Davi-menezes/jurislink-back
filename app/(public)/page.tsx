import Link from "next/link"
import { HeroSearch } from "@/components/hero-search"
import { CategoryCards } from "@/components/category-cards"
import { Button } from "@/components/ui/button"
import {
  Search,
  Star,
  Shield,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Users,
  Award,
} from "lucide-react"

export default function HomePage() {
  // Áreas jurídicas (hardcoded para SEO e performance)
  const areas = [
    { id: '1', name: 'Direito Civil', slug: 'civil', icon: 'FileText', is_active: true, created_at: '', description: null },
    { id: '2', name: 'Direito Penal', slug: 'penal', icon: 'Shield', is_active: true, created_at: '', description: null },
    { id: '3', name: 'Direito Trabalhista', slug: 'trabalhista', icon: 'Briefcase', is_active: true, created_at: '', description: null },
    { id: '4', name: 'Direito de Família', slug: 'familia', icon: 'Heart', is_active: true, created_at: '', description: null },
    { id: '5', name: 'Direito Empresarial', slug: 'empresarial', icon: 'Building2', is_active: true, created_at: '', description: null },
    { id: '6', name: 'Direito Tributário', slug: 'tributario', icon: 'Calculator', is_active: true, created_at: '', description: null },
    { id: '7', name: 'Direito do Consumidor', slug: 'consumidor', icon: 'ShoppingCart', is_active: true, created_at: '', description: null },
    { id: '8', name: 'Direito Imobiliário', slug: 'imobiliario', icon: 'Home', is_active: true, created_at: '', description: null },
    { id: '9', name: 'Direito Previdenciário', slug: 'previdenciario', icon: 'Clock', is_active: true, created_at: '', description: null },
    { id: '10', name: 'Direito Digital', slug: 'digital', icon: 'Monitor', is_active: true, created_at: '', description: null },
    { id: '11', name: 'Direito Ambiental', slug: 'ambiental', icon: 'TreePine', is_active: true, created_at: '', description: null },
    { id: '12', name: 'Direito Administrativo', slug: 'administrativo', icon: 'Landmark', is_active: true, created_at: '', description: null },
  ]

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary px-4 py-20 lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(221_83%_35%)_0%,_transparent_60%)]" />
        <div className="relative mx-auto max-w-4xl text-center">
          <h1 className="text-balance font-serif text-4xl text-primary-foreground md:text-5xl lg:text-6xl">
            Encontre o Advogado Ideal para o seu Caso
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg leading-relaxed text-primary-foreground/80">
            Conectamos voce aos melhores profissionais do direito no Brasil.
            Busque por especialidade, avalie perfis e entre em contato com
            facilidade.
          </p>
          <div className="mx-auto mt-8 max-w-2xl">
            <HeroSearch />
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-primary-foreground/70">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              Advogados verificados
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              100% gratuito para clientes
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              Avaliacoes reais
            </span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-card px-4 py-10">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-10 md:gap-16">
          <div className="text-center">
            <p className="font-serif text-3xl text-foreground">2.500+</p>
            <p className="mt-1 text-sm text-muted-foreground">Advogados Cadastrados</p>
          </div>
          <div className="text-center">
            <p className="font-serif text-3xl text-foreground">12</p>
            <p className="mt-1 text-sm text-muted-foreground">Areas do Direito</p>
          </div>
          <div className="text-center">
            <p className="font-serif text-3xl text-foreground">27</p>
            <p className="mt-1 text-sm text-muted-foreground">Estados Cobertos</p>
          </div>
          <div className="text-center">
            <p className="font-serif text-3xl text-foreground">4.8</p>
            <p className="mt-1 text-sm text-muted-foreground">Avaliacao Media</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-16 lg:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-balance font-serif text-3xl text-foreground">
              Como Funciona
            </h2>
            <p className="mt-2 text-muted-foreground">
              Encontre seu advogado em 3 passos simples
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                1. Busque
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Pesquise por area do direito, cidade ou nome do advogado. Use filtros para refinar sua busca.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Star className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                2. Compare
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Analise perfis, avaliacoes de outros clientes, especializacoes e valores cobrados.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                3. Entre em Contato
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Envie uma mensagem diretamente ao advogado escolhido e agende sua consulta.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-secondary px-4 py-16 lg:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-balance font-serif text-3xl text-foreground">
              Areas do Direito
            </h2>
            <p className="mt-2 text-muted-foreground">
              Encontre especialistas em diversas areas juridicas
            </p>
          </div>
          <div className="mt-10">
            <CategoryCards areas={areas} />
          </div>
        </div>
      </section>

      {/* For Lawyers CTA */}
      <section className="px-4 py-16 lg:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="overflow-hidden rounded-2xl bg-primary">
            <div className="flex flex-col items-center gap-8 px-8 py-12 text-center lg:flex-row lg:px-16 lg:text-left">
              <div className="flex-1">
                <h2 className="text-balance font-serif text-3xl text-primary-foreground">
                  Voce é Advogado?
                </h2>
                <p className="mt-3 text-pretty leading-relaxed text-primary-foreground/80">
                  Aumente sua visibilidade, receba novos clientes e gerencie sua
                  presenca online. Cadastro gratuito com opcoes premium para
                  destaque.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                  <Button
                    size="lg"
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                    asChild
                  >
                    <Link href="/auth/cadastro?role=LAWYER">
                      Cadastre-se Gratis
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="secondary"
                    className="bg-white text-primary hover:bg-white/90 border-2 border-white"
                    asChild
                  >
                    <Link href="/planos">Ver Planos</Link>
                  </Button>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex flex-col items-center gap-2 rounded-xl bg-primary-foreground/10 p-5">
                  <Users className="h-8 w-8 text-accent" />
                  <span className="text-2xl font-bold text-primary-foreground">10k+</span>
                  <span className="text-xs text-primary-foreground/70">Clientes/mes</span>
                </div>
                <div className="flex flex-col items-center gap-2 rounded-xl bg-primary-foreground/10 p-5">
                  <Award className="h-8 w-8 text-accent" />
                  <span className="text-2xl font-bold text-primary-foreground">OAB</span>
                  <span className="text-xs text-primary-foreground/70">Verificado</span>
                </div>
                <div className="flex flex-col items-center gap-2 rounded-xl bg-primary-foreground/10 p-5">
                  <Shield className="h-8 w-8 text-accent" />
                  <span className="text-2xl font-bold text-primary-foreground">LGPD</span>
                  <span className="text-xs text-primary-foreground/70">Conforme</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

