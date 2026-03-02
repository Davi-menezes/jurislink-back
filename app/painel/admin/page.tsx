import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Users, Scale, AlertTriangle, DollarSign, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default async function AdminDashboard() {
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

  if (!profile || profile.role !== "ADMIN") {
    redirect("/")
  }

  // Estatísticas gerais
  const { count: totalClients } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "CLIENT")

  const { count: totalLawyers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "LAWYER")

  const { count: pendingVerification } = await supabase
    .from("lawyer_profiles")
    .select("*", { count: "exact", head: true })
    .eq("verification_status", "PENDING")

  const { count: flaggedReviews } = await supabase
    .from("reviews")
    .select("*", { count: "exact", head: true })
    .eq("is_flagged", true)
    .eq("is_hidden", false)

  // Advogados pendentes
  const { data: pendingLawyers } = await supabase
    .from("lawyer_profiles")
    .select(`
      *,
      profiles:user_id (
        id,
        full_name,
        email,
        avatar_url,
        created_at
      )
    `)
    .eq("verification_status", "PENDING")
    .order("created_at", { ascending: false })
    .limit(10)

  // Avaliações denunciadas
  const { data: flaggedReviewsData } = await supabase
    .from("reviews")
    .select(`
      *,
      client:client_id (
        id,
        full_name
      ),
      lawyer_profile:lawyer_id (
        id,
        profiles:user_id (
          full_name
        )
      )
    `)
    .eq("is_flagged", true)
    .eq("is_hidden", false)
    .order("created_at", { ascending: false })
    .limit(10)

  // Pagamentos recentes
  const { data: recentPayments } = await supabase
    .from("payments")
    .select(`
      *,
      lawyer_profile:lawyer_id (
        id,
        profiles:user_id (
          full_name
        )
      )
    `)
    .order("created_at", { ascending: false })
    .limit(10)

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Painel Administrativo</h1>
              <p className="text-muted-foreground">Gestão da plataforma JurisLink</p>
            </div>
            <Badge variant="destructive">Admin</Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClients || 0}</div>
              <p className="text-xs text-muted-foreground">
                Total cadastrados
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Advogados</CardTitle>
              <Scale className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLawyers || 0}</div>
              <p className="text-xs text-muted-foreground">
                Total cadastrados
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingVerification || 0}</div>
              <p className="text-xs text-muted-foreground">
                Aguardando verificação
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Denúncias</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{flaggedReviews || 0}</div>
              <p className="text-xs text-muted-foreground">
                Avaliações denunciadas
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="verification" className="space-y-4">
          <TabsList>
            <TabsTrigger value="verification">
              Verificação de Advogados
              {pendingVerification && pendingVerification > 0 && (
                <Badge className="ml-2" variant="destructive">{pendingVerification}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="reviews">
              Avaliações Denunciadas
              {flaggedReviews && flaggedReviews > 0 && (
                <Badge className="ml-2" variant="destructive">{flaggedReviews}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="payments">Pagamentos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="verification" className="space-y-4">
            {pendingLawyers && pendingLawyers.length > 0 ? (
              <div className="space-y-4">
                {pendingLawyers.map((lawyer: any) => (
                  <Card key={lawyer.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            {lawyer.profiles?.avatar_url ? (
                              <img 
                                src={lawyer.profiles.avatar_url} 
                                alt={lawyer.profiles.full_name}
                                className="h-12 w-12 rounded-full object-cover"
                              />
                            ) : (
                              <Scale className="h-6 w-6 text-primary" />
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-base">{lawyer.profiles?.full_name}</CardTitle>
                            <CardDescription>
                              OAB {lawyer.oab_number}/{lawyer.oab_state} • {lawyer.profiles?.email}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                          Pendente
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Estado/Cidade</p>
                            <p className="font-medium">{lawyer.state} / {lawyer.city}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Experiência</p>
                            <p className="font-medium">{lawyer.years_experience} anos</p>
                          </div>
                        </div>
                        {lawyer.description && (
                          <div>
                            <p className="text-muted-foreground text-sm mb-1">Descrição</p>
                            <p className="text-sm">{lawyer.description}</p>
                          </div>
                        )}
                        <div className="flex gap-2 pt-2">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            Aprovar
                          </Button>
                          <Button size="sm" variant="destructive">
                            Rejeitar
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/admin/advogados/${lawyer.id}`}>
                              Ver Detalhes
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Scale className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Nenhum advogado aguardando verificação
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="reviews" className="space-y-4">
            {flaggedReviewsData && flaggedReviewsData.length > 0 ? (
              <div className="space-y-4">
                {flaggedReviewsData.map((review: any) => (
                  <Card key={review.id} className="border-red-200">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">
                            Avaliação de {review.client?.full_name}
                          </CardTitle>
                          <CardDescription>
                            Para {review.lawyer_profile?.profiles?.full_name} • {" "}
                            {new Date(review.created_at).toLocaleDateString("pt-BR")}
                          </CardDescription>
                        </div>
                        <Badge variant="destructive">Denunciada</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span key={star} className={star <= review.rating ? "text-yellow-400" : "text-gray-300"}>
                                ★
                              </span>
                            ))}
                          </div>
                          <p className="text-sm">{review.comment}</p>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button size="sm" variant="outline">
                            Manter Avaliação
                          </Button>
                          <Button size="sm" variant="destructive">
                            Ocultar Avaliação
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Nenhuma avaliação denunciada
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            {recentPayments && recentPayments.length > 0 ? (
              <div className="space-y-4">
                {recentPayments.map((payment: any) => (
                  <Card key={payment.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">
                            {payment.lawyer_profile?.profiles?.full_name}
                          </CardTitle>
                          <CardDescription>
                            {payment.type === "SUBSCRIPTION" ? "Assinatura" : "Boost"} • {" "}
                            {new Date(payment.created_at).toLocaleDateString("pt-BR")}
                          </CardDescription>
                        </div>
                        <Badge 
                          variant={payment.status === "APPROVED" ? "default" : "secondary"}
                          className={
                            payment.status === "APPROVED" 
                              ? "bg-green-500" 
                              : payment.status === "PENDING"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }
                        >
                          {payment.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          ID Externo: {payment.external_id || "N/A"}
                        </div>
                        <div className="text-lg font-bold">
                          R$ {(payment.amount_cents / 100).toFixed(2)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Nenhum pagamento registrado
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
