import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Heart, MessageSquare, User, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default async function ClientDashboard() {
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

  if (!profile || profile.role !== "CLIENT") {
    redirect("/")
  }

  // Buscar favoritos
  const { data: favorites } = await supabase
    .from("favorites")
    .select(`
      id,
      created_at,
      lawyer_profiles:lawyer_id (
        id,
        slug,
        oab_number,
        oab_state,
        avg_rating,
        total_reviews,
        profiles:user_id (
          id,
          full_name,
          avatar_url,
          state,
          city
        )
      )
    `)
    .eq("client_id", user.id)
    .order("created_at", { ascending: false })

  // Buscar avaliações do cliente
  const { data: reviews } = await supabase
    .from("reviews")
    .select(`
      id,
      rating,
      comment,
      lawyer_response,
      created_at,
      lawyer_profiles:lawyer_id (
        id,
        slug,
        profiles:user_id (
          full_name,
          avatar_url
        )
      )
    `)
    .eq("client_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Meu Painel</h1>
              <p className="text-muted-foreground">Olá, {profile.full_name}</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/painel/cliente/perfil">
                <User className="mr-2 h-4 w-4" />
                Editar Perfil
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Favoritos</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{favorites?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Advogados salvos
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avaliações</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reviews?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Avaliações feitas
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mensagens</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Mensagens enviadas
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="favorites" className="space-y-4">
          <TabsList>
            <TabsTrigger value="favorites">Advogados Favoritos</TabsTrigger>
            <TabsTrigger value="reviews">Minhas Avaliações</TabsTrigger>
          </TabsList>
          
          <TabsContent value="favorites" className="space-y-4">
            {favorites && favorites.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {favorites.map((fav: any) => (
                  <Card key={fav.id}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          {fav.lawyer_profiles?.profiles?.avatar_url ? (
                            <img 
                              src={fav.lawyer_profiles.profiles.avatar_url} 
                              alt={fav.lawyer_profiles.profiles.full_name}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-6 w-6 text-primary" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-base">
                            {fav.lawyer_profiles?.profiles?.full_name}
                          </CardTitle>
                          <CardDescription>
                            OAB {fav.lawyer_profiles?.oab_number}/{fav.lawyer_profiles?.oab_state}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{fav.lawyer_profiles?.avg_rating?.toFixed(1) || "0.0"}</span>
                          <span className="text-sm text-muted-foreground">
                            ({fav.lawyer_profiles?.total_reviews || 0})
                          </span>
                        </div>
                        <Button asChild size="sm">
                          <Link href={`/advogado/${fav.lawyer_profiles?.slug}`}>
                            Ver Perfil
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Heart className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Você ainda não salvou nenhum advogado como favorito
                  </p>
                  <Button asChild>
                    <Link href="/buscar">Buscar Advogados</Link>
                  </Button>
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
                            {review.lawyer_profiles?.profiles?.avatar_url ? (
                              <img 
                                src={review.lawyer_profiles.profiles.avatar_url} 
                                alt={review.lawyer_profiles.profiles.full_name}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <User className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-base">
                              {review.lawyer_profiles?.profiles?.full_name}
                            </CardTitle>
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
                      {review.lawyer_response && (
                        <div className="bg-secondary/50 rounded-lg p-3 mt-3">
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Resposta do advogado:
                          </p>
                          <p className="text-sm">{review.lawyer_response}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Star className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Você ainda não fez nenhuma avaliação
                  </p>
                  <Button asChild>
                    <Link href="/buscar">Buscar Advogados</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
