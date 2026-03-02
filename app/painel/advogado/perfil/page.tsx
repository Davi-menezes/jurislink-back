"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { BRAZILIAN_STATES } from "@/lib/types"
import { AvatarEditorUpload } from "@/components/avatar-editor-upload"

export default function LawyerProfileForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [legalAreas, setLegalAreas] = useState<any[]>([])
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    oab_number: "",
    oab_state: "",
    state: "",
    city: "",
    serves_entire_state: false,
    years_experience: 0,
    headline: "",
    bio: "",
    education: "",
    phone: "",
    website: "",
    linkedin: "",
    hourly_rate_min: "",
    hourly_rate_max: "",
    accepts_online: true,
    accepts_in_person: true,
    office_address: "",
    selected_areas: [] as string[],
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/auth/login")
      return
    }

    // Carregar áreas jurídicas
    const { data: areas } = await supabase
      .from("legal_areas")
      .select("*")
      .eq("is_active", true)
      .order("name")
    
    if (areas) setLegalAreas(areas)

    // Carregar perfil existente
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    const { data: lawyerProfile } = await supabase
      .from("lawyer_profiles")
      .select(`
        *,
        lawyer_legal_areas(area_id)
      `)
      .eq("user_id", user.id)
      .single()

    if (lawyerProfile) {
      setAvatarUrl(profile?.avatar_url || null)
      setFormData({
        oab_number: lawyerProfile.oab_number || "",
        oab_state: lawyerProfile.oab_state || "",
        state: profile?.state || "",
        city: profile?.city || "",
        serves_entire_state: lawyerProfile.serves_entire_state || false,
        years_experience: lawyerProfile.years_experience || 0,
        headline: lawyerProfile.headline || "",
        bio: lawyerProfile.bio || "",
        education: lawyerProfile.education || "",
        phone: profile?.phone || "",
        website: lawyerProfile.website || "",
        linkedin: lawyerProfile.linkedin || "",
        hourly_rate_min: lawyerProfile.hourly_rate_min?.toString() || "",
        hourly_rate_max: lawyerProfile.hourly_rate_max?.toString() || "",
        accepts_online: lawyerProfile.accepts_online !== false,
        accepts_in_person: lawyerProfile.accepts_in_person !== false,
        office_address: lawyerProfile.office_address || "",
        selected_areas: lawyerProfile.lawyer_legal_areas?.map((a: any) => a.area_id) || [],
      })
    }
    else {
      setAvatarUrl(profile?.avatar_url || null)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      toast.error("Não autenticado")
      setLoading(false)
      return
    }

    try {
      // Atualizar profile
      await supabase
        .from("profiles")
        .update({
          state: formData.state,
          city: formData.city,
          phone: formData.phone,
        })
        .eq("id", user.id)

      // Gerar slug
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single()

      const slug = profile?.full_name
        ?.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        + `-${formData.oab_number}-${formData.oab_state}`.toLowerCase()

      // Verificar se perfil do advogado já existe
      const { data: existingLawyer } = await supabase
        .from("lawyer_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single()

      if (existingLawyer) {
        // Atualizar
        await supabase
          .from("lawyer_profiles")
          .update({
            oab_number: formData.oab_number,
            oab_state: formData.oab_state,
            state: formData.state,
            city: formData.city,
            serves_entire_state: formData.serves_entire_state,
            years_experience: parseInt(formData.years_experience.toString()),
            headline: formData.headline,
            bio: formData.bio,
            education: formData.education,
            website: formData.website,
            linkedin: formData.linkedin,
            hourly_rate_min: formData.hourly_rate_min ? parseInt(formData.hourly_rate_min) : null,
            hourly_rate_max: formData.hourly_rate_max ? parseInt(formData.hourly_rate_max) : null,
            accepts_online: formData.accepts_online,
            accepts_in_person: formData.accepts_in_person,
            office_address: formData.office_address,
            slug,
          })
          .eq("id", existingLawyer.id)

        // Atualizar áreas jurídicas
        // Remover todas as existentes
        await supabase
          .from("lawyer_legal_areas")
          .delete()
          .eq("lawyer_id", existingLawyer.id)

        // Adicionar novas
        if (formData.selected_areas.length > 0) {
          await supabase
            .from("lawyer_legal_areas")
            .insert(
              formData.selected_areas.map(area_id => ({
                lawyer_id: existingLawyer.id,
                area_id,
              }))
            )
        }
      } else {
        // Criar novo
        const { data: newLawyer } = await supabase
          .from("lawyer_profiles")
          .insert({
            user_id: user.id,
            oab_number: formData.oab_number,
            oab_state: formData.oab_state,
            state: formData.state,
            city: formData.city,
            serves_entire_state: formData.serves_entire_state,
            years_experience: parseInt(formData.years_experience.toString()),
            headline: formData.headline,
            bio: formData.bio,
            education: formData.education,
            website: formData.website,
            linkedin: formData.linkedin,
            hourly_rate_min: formData.hourly_rate_min ? parseInt(formData.hourly_rate_min) : null,
            hourly_rate_max: formData.hourly_rate_max ? parseInt(formData.hourly_rate_max) : null,
            accepts_online: formData.accepts_online,
            accepts_in_person: formData.accepts_in_person,
            office_address: formData.office_address,
            slug,
          })
          .select()
          .single()

        // Adicionar áreas jurídicas
        if (newLawyer && formData.selected_areas.length > 0) {
          await supabase
            .from("lawyer_legal_areas")
            .insert(
              formData.selected_areas.map(area_id => ({
                lawyer_id: newLawyer.id,
                area_id,
              }))
            )
        }
      }

      toast.success("Perfil atualizado com sucesso!")
      router.push("/painel/advogado")
    } catch (error) {
      console.error(error)
      toast.error("Erro ao salvar perfil")
    } finally {
      setLoading(false)
    }
  }

  const handleAreaToggle = (areaId: string) => {
    setFormData(prev => ({
      ...prev,
      selected_areas: prev.selected_areas.includes(areaId)
        ? prev.selected_areas.filter(id => id !== areaId)
        : [...prev.selected_areas, areaId]
    }))
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Completar Perfil</h1>
            <p className="text-muted-foreground mt-2">
              Preencha suas informações profissionais
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AvatarEditorUpload initialUrl={avatarUrl} onUploaded={setAvatarUrl} />

            {/* Dados da OAB */}
            <Card>
              <CardHeader>
                <CardTitle>Dados da OAB</CardTitle>
                <CardDescription>
                  Informações sobre seu registro profissional
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="oab_number">Número da OAB *</Label>
                    <Input
                      id="oab_number"
                      value={formData.oab_number}
                      onChange={(e) => setFormData({...formData, oab_number: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="oab_state">Estado da OAB *</Label>
                    <Select value={formData.oab_state} onValueChange={(v) => setFormData({...formData, oab_state: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {BRAZILIAN_STATES.map(state => (
                          <SelectItem key={state.value} value={state.value}>
                            {state.value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Localização */}
            <Card>
              <CardHeader>
                <CardTitle>Localização</CardTitle>
                <CardDescription>Onde você atua</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="state">Estado *</Label>
                    <Select value={formData.state} onValueChange={(v) => setFormData({...formData, state: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {BRAZILIAN_STATES.map(state => (
                          <SelectItem key={state.value} value={state.value}>
                            {state.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="city">Cidade *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.serves_entire_state}
                    onCheckedChange={(v) => setFormData({...formData, serves_entire_state: v})}
                  />
                  <Label>Atendo todo o estado</Label>
                </div>
              </CardContent>
            </Card>

            {/* Áreas de Atuação */}
            <Card>
              <CardHeader>
                <CardTitle>Áreas de Atuação *</CardTitle>
                <CardDescription>
                  Selecione as áreas em que você atua
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {legalAreas.map(area => (
                    <div key={area.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={area.id}
                        checked={formData.selected_areas.includes(area.id)}
                        onCheckedChange={() => handleAreaToggle(area.id)}
                      />
                      <Label htmlFor={area.id} className="font-normal cursor-pointer">
                        {area.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sobre Você */}
            <Card>
              <CardHeader>
                <CardTitle>Sobre Você</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="years_experience">Anos de Experiência *</Label>
                  <Input
                    id="years_experience"
                    type="number"
                    min="0"
                    value={formData.years_experience}
                    onChange={(e) => setFormData({...formData, years_experience: parseInt(e.target.value) || 0})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="headline">Título Profissional</Label>
                  <Input
                    id="headline"
                    placeholder="Ex: Especialista em Direito do Trabalho"
                    value={formData.headline}
                    onChange={(e) => setFormData({...formData, headline: e.target.value})}
                    maxLength={100}
                  />
                </div>
                <div>
                  <Label htmlFor="bio">Sobre Mim</Label>
                  <Textarea
                    id="bio"
                    placeholder="Conte sobre sua experiência, especialidades e diferenciais"
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    rows={5}
                  />
                </div>
                <div>
                  <Label htmlFor="education">Formação</Label>
                  <Textarea
                    id="education"
                    placeholder="Graduação, pós-graduação, cursos relevantes"
                    value={formData.education}
                    onChange={(e) => setFormData({...formData, education: e.target.value})}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contato */}
            <Card>
              <CardHeader>
                <CardTitle>Informações de Contato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://seusite.com.br"
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    placeholder="https://linkedin.com/in/seuperfil"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({...formData, linkedin: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Valores */}
            <Card>
              <CardHeader>
                <CardTitle>Valores (Opcional)</CardTitle>
                <CardDescription>
                  Informe a faixa de valores dos seus honorários
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hourly_rate_min">Valor Mínimo (R$/hora)</Label>
                    <Input
                      id="hourly_rate_min"
                      type="number"
                      min="0"
                      value={formData.hourly_rate_min}
                      onChange={(e) => setFormData({...formData, hourly_rate_min: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="hourly_rate_max">Valor Máximo (R$/hora)</Label>
                    <Input
                      id="hourly_rate_max"
                      type="number"
                      min="0"
                      value={formData.hourly_rate_max}
                      onChange={(e) => setFormData({...formData, hourly_rate_max: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="accepts_online"
                      checked={formData.accepts_online}
                      onCheckedChange={(v) => setFormData({...formData, accepts_online: v === true})}
                    />
                    <Label htmlFor="accepts_online">Aceito atendimento online</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="accepts_in_person"
                      checked={formData.accepts_in_person}
                      onCheckedChange={(v) => setFormData({...formData, accepts_in_person: v === true})}
                    />
                    <Label htmlFor="accepts_in_person">Aceito atendimento presencial</Label>
                  </div>
                </div>
                {formData.accepts_in_person && (
                  <div>
                    <Label htmlFor="office_address">Endereço do Escritório</Label>
                    <Textarea
                      id="office_address"
                      placeholder="Rua, número, bairro, cidade, estado"
                      value={formData.office_address}
                      onChange={(e) => setFormData({...formData, office_address: e.target.value})}
                      rows={2}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading} size="lg" className="flex-1">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Perfil
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="lg"
                onClick={() => router.back()}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
