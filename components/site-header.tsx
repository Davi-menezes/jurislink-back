"use client"

import Link from "next/link"
import { useState } from "react"
import { Scale, Menu, X, User, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Profile } from "@/lib/types"

interface SiteHeaderProps {
  user?: Profile | null
}

export function SiteHeader({ user }: SiteHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Scale className="h-7 w-7 text-primary" />
          <span className="font-serif text-xl text-foreground">
            Juris<span className="text-accent">Link</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/buscar"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Buscar Advogados
          </Link>
          <Link
            href="/areas"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Areas do Direito
          </Link>
          <Link
            href="/como-funciona"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Como Funciona
          </Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="max-w-[120px] truncate">{user.full_name || "Minha Conta"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href={user.role === "LAWYER" ? "/painel/advogado" : user.role === "ADMIN" ? "/painel/admin" : "/painel/cliente"}>
                    Meu Painel
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={user.role === "LAWYER" ? "/painel/advogado/perfil" : user.role === "ADMIN" ? "/painel/admin" : "/painel/cliente"}>
                    Meu Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <form action="/auth/signout" method="post">
                    <button type="submit" className="w-full text-left">
                      Sair
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Entrar
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/cadastro">Cadastre-se</Link>
              </Button>
            </>
          )}
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden"
          aria-label="Abrir menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-card px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            <Link
              href="/buscar"
              className="text-sm font-medium text-muted-foreground"
              onClick={() => setMobileOpen(false)}
            >
              Buscar Advogados
            </Link>
            <Link
              href="/areas"
              className="text-sm font-medium text-muted-foreground"
              onClick={() => setMobileOpen(false)}
            >
              Areas do Direito
            </Link>
            <Link
              href="/como-funciona"
              className="text-sm font-medium text-muted-foreground"
              onClick={() => setMobileOpen(false)}
            >
              Como Funciona
            </Link>
            <div className="flex flex-col gap-2 pt-3 border-t border-border">
              {user ? (
                <Button variant="outline" size="sm" asChild>
                  <Link href={user.role === "LAWYER" ? "/painel/advogado" : user.role === "ADMIN" ? "/painel/admin" : "/painel/cliente"}>
                    Meu Painel
                  </Link>
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/auth/login">Entrar</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/auth/cadastro">Cadastre-se</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
