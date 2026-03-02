import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, Star, MessageSquare } from "lucide-react"

export const metadata = {
  title: "Como Funciona | JurisLink",
  description: "Entenda como encontrar e contratar advogados na JurisLink.",
}

export default function HowItWorksPage() {
  const steps = [
    {
      icon: Search,
      title: "1. Busque",
      text: "Pesquise por área do direito, cidade ou nome do profissional.",
    },
    {
      icon: Star,
      title: "2. Compare",
      text: "Analise perfil, experiência, avaliações e formas de atendimento.",
    },
    {
      icon: MessageSquare,
      title: "3. Entre em contato",
      text: "Envie sua mensagem e combine os próximos passos com o advogado.",
    },
  ]

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-serif text-3xl">Como Funciona</h1>
      <p className="mt-2 text-muted-foreground">
        Encontre o advogado ideal em poucos passos.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {steps.map((step) => (
          <Card key={step.title}>
            <CardHeader>
              <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <step.icon className="h-5 w-5 text-primary" />
              </div>
              <CardTitle>{step.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{step.text}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-10">
        <Button asChild>
          <Link href="/buscar">Começar minha busca</Link>
        </Button>
      </div>
    </div>
  )
}
