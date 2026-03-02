import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jurislink.com.br'
  const supabase = await createClient()

  // Páginas estáticas
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/buscar`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/termos`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacidade`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/planos`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]

  // Buscar áreas jurídicas
  const { data: areas } = await supabase
    .from('legal_areas')
    .select('slug, updated_at')
    .eq('is_active', true)

  const areaPages: MetadataRoute.Sitemap = areas?.map((area) => ({
    url: `${baseUrl}/buscar?area=${area.slug}`,
    lastModified: new Date(area.updated_at || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  })) || []

  // Buscar perfis de advogados aprovados
  const { data: lawyers } = await supabase
    .from('lawyer_profiles')
    .select('slug, updated_at')
    .eq('is_approved', true)
    .not('slug', 'is', null)
    .limit(5000) // Limite para não sobrecarregar

  const lawyerPages: MetadataRoute.Sitemap = lawyers?.map((lawyer) => ({
    url: `${baseUrl}/advogado/${lawyer.slug}`,
    lastModified: new Date(lawyer.updated_at || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  })) || []

  return [...staticPages, ...areaPages, ...lawyerPages]
}
