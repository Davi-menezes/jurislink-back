import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Metadata } from "next"
import { 
  MapPin, 
  Briefcase, 
  Award, 
  Star, 
  Phone, 
  Globe, 
  Linkedin,
  MessageSquare,
  Heart,
  Share2,
  TrendingUp
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { StarRating } from "@/components/star-rating"
import Link from "next/link"

interface LawyerPageProps {
  params: {
    slug: string
  }
}

async function getLawyerBySlug(slug: string) {
  const supabase = await createClient()
  
  const { data: lawyer } = await supabase
    .from("lawyer_profiles")
    .select(`
      *,
      profiles:user_id (
        id,
        full_name,
        avatar_url,
        state,
        city,
        phone
      ),
      lawyer_legal_areas(
        legal_areas(
          id,
          name,
          slug,
          icon
        )
      )
    `)
    .eq("slug", slug)
    .eq("is_approved", true)
    .single()

  if (!lawyer) {
    return null
  }

  // Incrementar visualizações
  await supabase
    .from("lawyer_profiles")
    .update({ total_views: (lawyer.total_views || 0) + 1 })
    .eq("id", lawyer.id)

  // Buscar avaliações
  const { data: reviews } = await supabase
    .from("reviews")
    .select(`
      *,
      profiles:client_id (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq("lawyer_id", lawyer.id)
    .eq("is_hidden", false)
    .order("created_at", { ascending: false })

  return { lawyer, reviews }
}

export async function generateMetadata({ params }: LawyerPageProps): Promise<Metadata> {
  const data = await getLawyerBySlug(params.slug)
  
  if (!data) {
    return {
      title: "Advogado não encontrado",
    }
  }

  const { lawyer } = data
  const lawyerName = lawyer.profiles?.full_name
  const areas = lawyer.lawyer_legal_areas?.map((lla: any) => lla.legal_areas?.name).join(", ")
  const location = `${lawyer.profiles?.city}, ${lawyer.profiles?.state}`
  
  const title = `${lawyerName} - Advogado${areas ? ` de ${areas}` : ""} | JurisLink`
  const description = lawyer.headline || 
    `${lawyerName} - OAB ${lawyer.oab_number}/${lawyer.oab_state}. ${areas}. ${location}. ${lawyer.years_experience} anos de experiência. Avaliação: ${lawyer.avg_rating?.toFixed(1) || "0.0"} estrelas.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      images: lawyer.profiles?.avatar_url ? [lawyer.profiles.avatar_url] : [],
      locale: "pt_BR",
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: lawyer.profiles?.avatar_url ? [lawyer.profiles.avatar_url] : [],
    },
    alternates: {
      canonical: `/advogado/${params.slug}`,
    },
  }
}

export default async function LawyerPage({ params }: LawyerPageProps) {
  const data = await getLawyerBySlug(params.slug)

  if (!data) {
    notFound()
  }

  const { lawyer, reviews } = data
  const lawyerName = lawyer.profiles?.full_name
  const areas = lawyer.lawyer_legal_areas || []
  const isPremium = lawyer.is_premium
  const isBoostActive = lawyer.boost_until && new Date(lawyer.boost_until) > new Date()

  // JSON-LD Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LegalService",
    "name": lawyerName,
    "description": lawyer.headline || lawyer.bio,
    "image": lawyer.profiles?.avatar_url,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": lawyer.profiles?.city,
      "addressRegion": lawyer.profiles?.state,
      "addressCountry": "BR"
    },
    "aggregateRating": lawyer.total_reviews > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": lawyer.avg_rating,
      "reviewCount": lawyer.total_reviews
    } : undefined,
    "priceRange": lawyer.hourly_rate_min && lawyer.hourly_rate_max 
      ? `R$ ${lawyer.hourly_rate_min} - R$ ${lawyer.hourly_rate_max}`
      : undefined,
    "telephone": lawyer.profiles?.phone,
    "url": `${process.env.NEXT_PUBLIC_APP_URL}/advogado/${params.slug}`,
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Verificar se está favoritado
  let isFavorited = false
  if (user) {
    const { data: fav } = await supabase
      .from("favorites")
      .select("id")
      .eq("client_id", user.id)
      .eq("lawyer_id", lawyer.id)
      .single()
    isFavorited = !!fav
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-secondary/30">
        {/* Header */}
        <div className="bg-card border-b">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="relative">
                <div className="h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                  {lawyer.profiles?.avatar_url ? (
                    <img 
                      src={lawyer.profiles.avatar_url} 
                      alt={lawyerName}
                      className="h-32 w-32 rounded-full object-cover"
                    />
                  ) : (
                    <Briefcase className="h-16 w-16 text-primary" />
                  )}
                </div>
                {lawyer.oab_verified && (
                  <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1.5">
                    <Award className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-3xl font-bold">{lawyerName}</h1>
                      {isPremium && (
                        <Badge className="bg-gradient-to-r from-amber-500 to-amber-600">
                          Premium
                        </Badge>
                      )}
                      {isBoostActive && (
                        <Badge className="bg-gradient-to-r from-purple-500 to-purple-600">
                          <TrendingUp className="mr-1 h-3 w-3" />
                          Em destaque
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-muted-foreground mb-3">
                      OAB {lawyer.oab_number}/{lawyer.oab_state}
                      {lawyer.oab_verified && " • Verificado"}
                    </p>

                    {lawyer.headline && (
                      <p className="text-lg mb-3">{lawyer.headline}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {lawyer.profiles?.city}, {lawyer.profiles?.state}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {lawyer.years_experience} anos de experiência
                      </span>
                      {lawyer.avg_rating > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          {lawyer.avg_rating.toFixed(1)} ({lawyer.total_reviews} {lawyer.total_reviews === 1 ? "avaliação" : "avaliações"})
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {areas.map((lla: any) => (
                        <Badge key={lla.legal_areas.id} variant="secondary">
                          {lla.legal_areas.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="icon">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Heart className={`h-4 w-4 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
                    </Button>
                    <Button asChild size="lg">
                      <Link href="#contato">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Entrar em Contato
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              {lawyer.bio && (
                <Card>
                  <CardHeader>
                    <CardTitle>Sobre</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-line">{lawyer.bio}</p>
                  </CardContent>
                </Card>
              )}

              {/* Education */}
              {lawyer.education && (
                <Card>
                  <CardHeader>
                    <CardTitle>Formação</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-line">{lawyer.education}</p>
                  </CardContent>
                </Card>
              )}

              {/* Reviews */}
              <Card id="avaliacoes">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Avaliações</CardTitle>
                      <CardDescription>
                        {lawyer.total_reviews} {lawyer.total_reviews === 1 ? "avaliação" : "avaliações"}
                      </CardDescription>
                    </div>
                    {user && (
                      <Button asChild variant="outline">
                        <Link href={`/advogado/${params.slug}/avaliar`}>
                          Avaliar
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {reviews && reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.map((review: any) => (
                        <div key={review.id}>
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              {review.profiles?.avatar_url ? (
                                <img 
                                  src={review.profiles.avatar_url} 
                                  alt={review.profiles.full_name}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-sm font-medium">
                                  {review.profiles?.full_name?.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-medium">{review.profiles?.full_name}</p>
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-4 w-4 ${
                                        star <= review.rating
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {new Date(review.created_at).toLocaleDateString("pt-BR")}
                              </p>
                              <p className="text-sm">{review.comment}</p>
                              {review.lawyer_response && (
                                <div className="mt-3 bg-secondary/50 rounded-lg p-3">
                                  <p className="text-xs font-medium text-muted-foreground mb-1">
                                    Resposta do advogado:
                                  </p>
                                  <p className="text-sm">{review.lawyer_response}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          <Separator className="mt-6" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Ainda não há avaliações para este advogado
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Form */}
              <Card id="contato">
                <CardHeader>
                  <CardTitle>Entre em Contato</CardTitle>
                  <CardDescription>
                    Envie uma mensagem e receba uma resposta em breve
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Nome</label>
                      <input 
                        type="text" 
                        className="w-full mt-1 px-3 py-2 border rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <input 
                        type="email" 
                        className="w-full mt-1 px-3 py-2 border rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Telefone</label>
                      <input 
                        type="tel" 
                        className="w-full mt-1 px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Mensagem</label>
                      <textarea 
                        className="w-full mt-1 px-3 py-2 border rounded-lg"
                        rows={4}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Enviar Mensagem
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {lawyer.hourly_rate_min && lawyer.hourly_rate_max && (
                    <div>
                      <p className="text-sm text-muted-foreground">Honorários</p>
                      <p className="font-medium">
                        R$ {lawyer.hourly_rate_min} - R$ {lawyer.hourly_rate_max}/hora
                      </p>
                    </div>
                  )}
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Atendimento</p>
                    <div className="space-y-1">
                      {lawyer.accepts_online && (
                        <Badge variant="secondary">Online</Badge>
                      )}
                      {lawyer.accepts_in_person && (
                        <Badge variant="secondary">Presencial</Badge>
                      )}
                    </div>
                  </div>
                  {(lawyer.profiles?.phone || lawyer.website || lawyer.linkedin) && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        {lawyer.profiles?.phone && (
                          <a href={`tel:${lawyer.profiles.phone}`} className="flex items-center gap-2 text-sm hover:text-primary">
                            <Phone className="h-4 w-4" />
                            {lawyer.profiles.phone}
                          </a>
                        )}
                        {lawyer.website && (
                          <a href={lawyer.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm hover:text-primary">
                            <Globe className="h-4 w-4" />
                            Website
                          </a>
                        )}
                        {lawyer.linkedin && (
                          <a href={lawyer.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm hover:text-primary">
                            <Linkedin className="h-4 w-4" />
                            LinkedIn
                          </a>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Disclaimer */}
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <p className="text-xs text-muted-foreground">
                    A JurisLink não presta serviços jurídicos. Esta plataforma apenas conecta clientes a advogados independentes.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
