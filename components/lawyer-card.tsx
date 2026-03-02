import Link from "next/link"
import { MapPin, Clock, Video, Zap, Award } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StarRating } from "@/components/star-rating"

interface LawyerCardProps {
  lawyer: {
    id: string
    headline: string | null
    experience_years: number
    hourly_rate_min: number | null
    hourly_rate_max: number | null
    accepts_online: boolean
    avg_rating: number
    total_reviews: number
    response_time_hours: number
    is_premium: boolean
    boost_active: boolean
    oab_number: string
    oab_state: string
    profiles: {
      full_name: string
      avatar_url: string | null
      state: string | null
      city: string | null
    }
    lawyer_legal_areas: {
      legal_areas: {
        name: string
        slug: string
      }
    }[]
  }
}

export function LawyerCard({ lawyer }: LawyerCardProps) {
  const initials = lawyer.profiles.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <Link
      href={`/advogado/${lawyer.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/30 hover:shadow-md"
    >
      {(lawyer.is_premium || lawyer.boost_active) && (
        <div className="flex items-center gap-1.5 bg-accent/10 px-4 py-1.5">
          {lawyer.boost_active && (
            <span className="flex items-center gap-1 text-xs font-medium text-accent">
              <Zap className="h-3 w-3" /> Destaque
            </span>
          )}
          {lawyer.is_premium && (
            <span className="flex items-center gap-1 text-xs font-medium text-primary">
              <Award className="h-3 w-3" /> Premium
            </span>
          )}
        </div>
      )}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 border-2 border-border">
            <AvatarImage src={lawyer.profiles.avatar_url || undefined} alt={lawyer.profiles.full_name} />
            <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground group-hover:text-primary">
              {lawyer.profiles.full_name}
            </h3>
            <p className="text-xs text-muted-foreground">
              OAB/{lawyer.oab_state} {lawyer.oab_number}
            </p>
          </div>
        </div>

        {lawyer.headline && (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {lawyer.headline}
          </p>
        )}

        <div className="flex flex-wrap gap-1.5">
          {lawyer.lawyer_legal_areas.slice(0, 3).map((lla) => (
            <Badge key={lla.legal_areas.slug} variant="secondary" className="text-xs">
              {lla.legal_areas.name}
            </Badge>
          ))}
          {lawyer.lawyer_legal_areas.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{lawyer.lawyer_legal_areas.length - 3}
            </Badge>
          )}
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {(lawyer.profiles.city || lawyer.profiles.state) && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {[lawyer.profiles.city, lawyer.profiles.state].filter(Boolean).join(", ")}
            </span>
          )}
          {lawyer.accepts_online && (
            <span className="flex items-center gap-1 text-primary">
              <Video className="h-3 w-3" />
              Online
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {lawyer.response_time_hours}h
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <StarRating rating={lawyer.avg_rating} size="sm" showValue />
          <span className="text-xs text-muted-foreground">
            {lawyer.total_reviews} avaliacoes
          </span>
          {lawyer.hourly_rate_min && (
            <span className="text-sm font-semibold text-foreground">
              R$ {lawyer.hourly_rate_min.toLocaleString("pt-BR")}
              {lawyer.hourly_rate_max && lawyer.hourly_rate_max !== lawyer.hourly_rate_min
                ? ` - ${lawyer.hourly_rate_max.toLocaleString("pt-BR")}`
                : ""}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
