import Link from "next/link"
import {
  Briefcase,
  Heart,
  FileText,
  Shield,
  ShoppingCart,
  Calculator,
  Building2,
  Home,
  Clock,
  Monitor,
  TreePine,
  Landmark,
} from "lucide-react"
import type { LegalArea } from "@/lib/types"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Briefcase,
  Heart,
  FileText,
  Shield,
  ShoppingCart,
  Calculator,
  Building2,
  Home,
  Clock,
  Monitor,
  TreePine,
  Landmark,
}

interface CategoryCardsProps {
  areas: LegalArea[]
}

export function CategoryCards({ areas }: CategoryCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {areas.map((area) => {
        const IconComponent = iconMap[area.icon || "FileText"] || FileText
        return (
          <Link
            key={area.id}
            href={`/buscar?area=${area.slug}`}
            className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 text-center transition-all hover:border-primary/30 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <IconComponent className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium text-foreground">{area.name}</span>
          </Link>
        )
      })}
    </div>
  )
}
