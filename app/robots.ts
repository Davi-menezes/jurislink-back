import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jurislink.com.br'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/painel/',
          '/api/',
          '/auth/callback',
          '/auth/error',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
