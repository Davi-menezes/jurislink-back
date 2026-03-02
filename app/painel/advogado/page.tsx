import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Eye, Star, MessageSquare, TrendingUp, CreditCard, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default async function LawyerDashboard() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "LAWYER") {
    redirect("/")
  }

  // Buscar perfil do advogado
  const { data: lawyerProfile } = await supabase
    .from("lawyer_profiles")
    .select(`
      *,
      lawyer_legal_areas(legal_areas(id, name, slug, icon))
    `)
    .eq("user_id", user.id)
    .single()

  if (!lawyerProfile) {
    redirect("/painel/advogado/completar-perfil")
  }

  // Buscar leads/contatos
  const { data: contacts } = await supabase
    .from("contacts")
    .select("*")
    .eq("lawyer_id", lawyerProfile.id)
    .order("created_at", { ascending: false })
    .limit(10)

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
    .eq("lawyer_id", lawyerProfile.id)
    .eq("is_hidden", false)
    .order("created_at", { ascending: false })

  const isPremium = lawyerProfile.subscription_status === "ACTIVE"
  const isBoostActive = lawyerProfile.boost_until && new Date(lawyerProfile.boost_until) > new Date()
  const isApproved = lawyerProfile.verification_status === "VERIFIED"

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Painel do Advogado</h1>
              <p className="text-muted-foreground">OAB {lawyerProfile.oab_number}/{lawyerProfile.oab_state}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {!isApproved && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                  Aguardando Verificação
                </Badge>
              )}
              {isApproved && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                  <Award className="mr-1 h-3 w-3" />
                  Verificado
                </Badge>
              )}
              {isPremium ? (
                <Badge className="bg-gradient-to-r from-amber-500 to-amber-600">
                  Premium Ativo
                </Badge>
              ) : (
                <Badge variant="outline">
                  Plano Gratuito
                </Badge>
              )}
              {isBoostActive && (
                <Badge className="bg-gradient-to-r from-purple-500 to-purple-600">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  Boost Ativo
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {!isPremium && (
          <Card className="mb-8 border-primary bg-primary/5">
            <CardHeader>
              <CardTitle>Ative seu Plano Premium</CardTitle>
              <CardDescription>
                Aumente sua visibilidade e apareça nas buscas de clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild className="bg-primary">
                  <Link href="/painel/advogado/assinatura">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Ver Planos
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/painel/advogado/perfil">
                    Completar Perfil
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lawyerProfile.total_views || 0}</div>
              <p className="text-xs text-muted-foreground">
                Este mês
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avaliação</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {lawyerProfile.avg_rating ? lawyerProfile.avg_rating.toFixed(1) : "0.0"}
              </div>
              <p className="text-xs text-muted-foreground">
                {lawyerProfile.total_reviews || 0} avaliações
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leads</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contacts?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                {contacts?.filter((c: any) => !c.is_read).length || 0} não lidos
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Perfil</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lawyerProfile.profile_completeness || 0}%</div>
              <p className="text-xs text-muted-foreground">
                Completude
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="leads" className="space-y-4">
          <TabsList>
            <TabsTrigger value="leads">Leads Recebidos</TabsTrigger>
            <TabsTrigger value="reviews">Avaliações</TabsTrigger>
            <TabsTrigger value="boost">Impulsionar</TabsTrigger>
          </TabsList>
          
          <TabsContent value="leads" className="space-y-4">
            {contacts && contacts.length > 0 ? (
              <div className="space-y-4">
                {contacts.map((contact: any) => (
                  <Card key={contact.id} className={!contact.is_read ? "border-primary" : ""}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">{contact.client_name}</CardTitle>
                          <CardDescription>
                            {contact.client_email} • {contact.client_phone || "Sem telefone"}
                          </CardDescription>
                        </div>
                        {!contact.is_read && (
                          <Badge>Novo</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">{contact.message}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{new Date(contact.created_at).toLocaleString("pt-BR")}</span>
                        <Button size="sm" asChild>
                          <a href={`mailto:${contact.client_email}`}>Responder</a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Nenhum lead recebido ainda
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="reviews" className="space-y-4">
            {reviews && reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review: any) => (
                  <Card key={review.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
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
                          <div>
                            <CardTitle className="text-base">{review.profiles?.full_name}</CardTitle>
                            <CardDescription>
                              {new Date(review.created_at).toLocaleDateString("pt-BR")}
                            </CardDescription>
                          </div>
                        </div>
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
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-3">{review.comment}</p>
                      {review.lawyer_response ? (
                        <div className="bg-secondary/50 rounded-lg p-3">
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Sua resposta:
                          </p>
                          <p className="text-sm">{review.lawyer_response}</p>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/painel/advogado/avaliacoes/${review.id}`}>
                            Responder Avaliação
                          </Link>
                        </Button>
                      )}
                      {review.is_flagged && (
                        <Badge variant="destructive" className="mt-2">
                          Denunciada
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Star className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Nenhuma avaliação ainda
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="boost" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Impulsione seu Perfil</CardTitle>
                <CardDescription>
                  Aumente temporariamente sua posição nos resultados de busca
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isBoostActive ? (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
                      <p className="font-medium text-purple-900 mb-2">
                        ✨ Seu perfil está impulsionado!
                      </p>
                      <p className="text-sm text-purple-700">
                        Ativo até: {new Date(lawyerProfile.boost_until!).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <Button variant="outline" disabled>
                      Boost Ativo
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Benefícios do Boost:</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>✓ Apareça no topo dos resultados por 30 dias</li>
                        <li>✓ Destaque visual nos cards de busca</li>
                        <li>✓ Até 3x mais visualizações</li>
                      </ul>
                    </div>
                    <div className="flex items-end gap-2">
                      <div>
                        <p className="text-3xl font-bold">R$ 99</p>
                        <p className="text-xs text-muted-foreground">por 30 dias</p>
                      </div>
                    </div>
                    <Button asChild className="w-full">
                      <Link href="/painel/advogado/boost">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Ativar Boost Agora
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
