import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Web Scraper para Comercio Electrónico',
  description: 'Herramienta profesional para extraer precios y información de productos de sitios de comercio electrónico como Amazon, eBay y MercadoLibre',
  keywords: ['web scraping', 'precios', 'productos', 'amazon', 'ebay', 'mercadolibre', 'ecommerce'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
          {children}
        </div>
      </body>
    </html>
  )
}