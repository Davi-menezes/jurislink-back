"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BRAZILIAN_STATES } from "@/lib/types"

export function HeroSearch() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [state, setState] = useState("")

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query) params.set("q", query)
    if (state) params.set("estado", state)
    router.push(`/buscar?${params.toString()}`)
  }

  return (
    <form
      onSubmit={handleSearch}
      className="flex flex-col gap-3 rounded-xl bg-card p-3 shadow-lg sm:flex-row sm:items-center"
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Ex: direito trabalhista, divorcio..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border-0 bg-secondary pl-10 shadow-none focus-visible:ring-1"
        />
      </div>
      <div className="relative w-full sm:w-48">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Select value={state} onValueChange={setState}>
          <SelectTrigger className="border-0 bg-secondary pl-10 shadow-none focus:ring-1">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            {BRAZILIAN_STATES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" size="lg" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
        <Search className="h-4 w-4" />
        Buscar
      </Button>
    </form>
  )
}
