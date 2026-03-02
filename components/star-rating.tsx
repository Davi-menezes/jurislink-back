import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  rating: number
  max?: number
  size?: "sm" | "md" | "lg"
  showValue?: boolean
  className?: string
}

const sizes = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
}

export function StarRating({
  rating,
  max = 5,
  size = "md",
  showValue = false,
  className,
}: StarRatingProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex">
        {Array.from({ length: max }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              sizes[size],
              i < Math.round(rating)
                ? "fill-accent text-accent"
                : "fill-muted text-muted"
            )}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-foreground">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}
