export type UserRole = 'CLIENT' | 'LAWYER' | 'ADMIN'

export interface Profile {
  id: string
  role: UserRole
  full_name: string
  avatar_url: string | null
  state: string | null
  city: string | null
  phone: string | null
  lgpd_accepted: boolean
  lgpd_accepted_at: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface LegalArea {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  is_active: boolean
  created_at: string
}

export interface LawyerProfile {
  id: string
  oab_number: string
  oab_state: string
  oab_verified: boolean
  headline: string | null
  bio: string | null
  experience_years: number
  education: string | null
  hourly_rate_min: number | null
  hourly_rate_max: number | null
  accepts_online: boolean
  accepts_in_person: boolean
  office_address: string | null
  office_lat: number | null
  office_lng: number | null
  website: string | null
  linkedin: string | null
  is_premium: boolean
  premium_until: string | null
  boost_active: boolean
  boost_until: string | null
  avg_rating: number
  total_reviews: number
  total_views: number
  response_time_hours: number
  profile_completeness: number
  is_approved: boolean
  created_at: string
  updated_at: string
}

export interface LawyerWithProfile extends LawyerProfile {
  profiles: Profile
  lawyer_legal_areas: { legal_areas: LegalArea }[]
}

export interface Review {
  id: string
  lawyer_id: string
  client_id: string
  rating: number
  title: string | null
  comment: string | null
  is_anonymous: boolean
  is_approved: boolean
  lawyer_response: string | null
  lawyer_responded_at: string | null
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface Favorite {
  id: string
  client_id: string
  lawyer_id: string
  created_at: string
}

export interface Contact {
  id: string
  client_id: string | null
  lawyer_id: string
  client_name: string
  client_email: string
  client_phone: string | null
  subject: string
  message: string
  status: 'PENDING' | 'VIEWED' | 'REPLIED' | 'ARCHIVED'
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  user_id: string
  type: 'PREMIUM' | 'BOOST' | 'FEATURED'
  amount: number
  currency: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REFUNDED'
  external_id: string | null
  external_provider: string
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface SearchFilters {
  query?: string
  legal_area?: string
  state?: string
  city?: string
  min_rating?: number
  accepts_online?: boolean
  price_range?: 'low' | 'medium' | 'high'
  sort_by?: 'rating' | 'reviews' | 'price_low' | 'price_high' | 'relevance'
  page?: number
  per_page?: number
}

export const BRAZILIAN_STATES = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapa' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceara' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espirito Santo' },
  { value: 'GO', label: 'Goias' },
  { value: 'MA', label: 'Maranhao' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Para' },
  { value: 'PB', label: 'Paraiba' },
  { value: 'PR', label: 'Parana' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piaui' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondonia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'Sao Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
] as const
