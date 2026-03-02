"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LawyerCard } from "@/components/lawyer-card"
import { BRAZILIAN_STATES } from "@/lib/types"
import type { LegalArea } from "@/lib/types"
import { buildApiUrl } from "@/lib/api"

interface SearchResultsProps {
  areas: LegalArea[]
}

export function SearchResults({ areas }: SearchResultsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [lawyers, setLawyers] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  // Filter state from URL
  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [area, setArea] = useState(searchParams.get("area") || "")
  const [state, setState] = useState(searchParams.get("estado") || "")
  const [minRating, setMinRating] = useState(searchParams.get("min_rating") || "")
  const [acceptsOnline, setAcceptsOnline] = useState(
    searchParams.get("online") === "true"
  )
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "relevance")
  const [page, setPage] = useState(Number(searchParams.get("page") || 1))

  const fetchLawyers = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (query) params.set("q", query)
    if (area) params.set("area", area)
    if (state) params.set("estado", state)
    if (minRating) params.set("min_rating", minRating)
    if (acceptsOnline) params.set("online", "true")
    if (sortBy) params.set("sort", sortBy)
    params.set("page", String(page))
    params.set("per_page", "12")

    try {
      const res = await fetch(buildApiUrl(`/api/lawyers/search?${params.toString()}`))
      const data = await res.json()
      setLawyers(data.lawyers || [])
      setTotal(data.total || 0)
    } catch {
      setLawyers([])
    }
    setLoading(false)
  }, [query, area, state, minRating, acceptsOnline, sortBy, page])

  useEffect(() => {
    fetchLawyers()
  }, [fetchLawyers])

  function applyFilters() {
    const params = new URLSearchParams()
    if (query) params.set("q", query)
    if (area) params.set("area", area)
    if (state) params.set("estado", state)
    if (minRating) params.set("min_rating", minRating)
    if (acceptsOnline) params.set("online", "true")
    if (sortBy !== "relevance") params.set("sort", sortBy)
    router.push(`/buscar?${params.toString()}`)
    setPage(1)
  }

  function clearFilters() {
    setQuery("")
    setArea("")
    setState("")
    setMinRating("")
    setAcceptsOnline(false)
    setSortBy("relevance")
    setPage(1)
    router.push("/buscar")
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      {/* Mobile filter toggle */}
      <div className="flex items-center justify-between lg:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
        </Button>
        <span className="text-sm text-muted-foreground">{total} resultados</span>
      </div>

      {/* Filters sidebar */}
      <aside
        className={`${
          showFilters ? "block" : "hidden"
        } lg:block`}
      >
        <div className="sticky top-20 flex flex-col gap-5 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Filtros</h3>
            <button
              onClick={clearFilters}
              className="text-xs text-primary hover:underline"
            >
              Limpar
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-xs">Buscar</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Nome, area..."
                className="h-9 pl-9 text-sm"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-xs">Area do Direito</Label>
            <Select value={area} onValueChange={setArea}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Todas as areas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as areas</SelectItem>
                {areas.map((a) => (
                  <SelectItem key={a.id} value={a.slug}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-xs">Estado</Label>
            <Select value={state} onValueChange={setState}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Todos os estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os estados</SelectItem>
                {BRAZILIAN_STATES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-xs">Avaliacao minima</Label>
            <Select value={minRating} onValueChange={setMinRating}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Qualquer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Qualquer</SelectItem>
                <SelectItem value="3">3+ estrelas</SelectItem>
                <SelectItem value="4">4+ estrelas</SelectItem>
                <SelectItem value="4.5">4.5+ estrelas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="online"
              checked={acceptsOnline}
              onCheckedChange={(c) => setAcceptsOnline(c === true)}
            />
            <Label htmlFor="online" className="text-sm">
              Atende online
            </Label>
          </div>

          <Button onClick={applyFilters} size="sm">
            Aplicar Filtros
          </Button>
        </div>
      </aside>

      {/* Results */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <span className="hidden text-sm text-muted-foreground lg:block">
            {total} advogados encontrados
          </span>
          <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1) }}>
            <SelectTrigger className="h-9 w-48 text-sm">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevancia</SelectItem>
              <SelectItem value="rating">Melhor avaliacao</SelectItem>
              <SelectItem value="reviews">Mais avaliacoes</SelectItem>
              <SelectItem value="price_low">Menor preco</SelectItem>
              <SelectItem value="price_high">Maior preco</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : lawyers.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border py-16 text-center">
            <Search className="h-10 w-10 text-muted-foreground/40" />
            <div>
              <h3 className="font-medium text-foreground">Nenhum advogado encontrado</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Tente ajustar os filtros ou buscar por outro termo.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={clearFilters} className="gap-2">
              <X className="h-3.5 w-3.5" />
              Limpar filtros
            </Button>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {lawyers.map((lawyer) => (
                <LawyerCard key={lawyer.id} lawyer={lawyer} />
              ))}
            </div>
            {total > 12 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  Pagina {page} de {Math.ceil(total / 12)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page * 12 >= total}
                  onClick={() => setPage(page + 1)}
                >
                  Proxima
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
