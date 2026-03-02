import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import type { Metadata } from "next"
import { SearchResults } from "./search-results"

export const metadata: Metadata = {
  title: "Buscar Advogados",
  description: "Encontre advogados especializados em diversas areas do direito em todo o Brasil.",
}

export default async function SearchPage() {
  const supabase = await createClient()
  const { data: areas } = await supabase
    .from("legal_areas")
    .select("*")
    .eq("is_active", true)
    .order("name")

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-foreground">Buscar Advogados</h1>
        <p className="mt-1 text-muted-foreground">
          Encontre o profissional ideal para o seu caso
        </p>
      </div>
      <Suspense fallback={<SearchSkeleton />}>
        <SearchResults areas={areas || []} />
      </Suspense>
    </div>
  )
}

function SearchSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <div className="h-96 animate-pulse rounded-xl bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-72 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  )
}
