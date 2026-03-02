import type { Metadata, Viewport } from 'next'
import { Inter, DM_Serif_Display } from 'next/font/google'
import { Toaster } from 'sonner'

import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const dmSerif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-dm-serif',
})

export const metadata: Metadata = {
  title: {
    default: 'JurisLink - Encontre o Advogado Ideal',
    template: '%s | JurisLink',
  },
  description:
    'Marketplace juridico brasileiro. Encontre advogados especializados, compare avaliacoes e agende consultas online.',
  keywords: ['advogado', 'juridico', 'direito', 'consulta juridica', 'OAB', 'Brasil'],
}

export const viewport: Viewport = {
  themeColor: '#1a3a6b',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${dmSerif.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
