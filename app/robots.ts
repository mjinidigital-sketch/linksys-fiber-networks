import { MetadataRoute } from 'next'
import { getWebsiteContentServer } from '@/lib/get-website-content'

export default async function robots(): Promise<MetadataRoute.Robots> {
  let allowIndexing = true
  let baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://linksysfiber.ke'

  const content = await getWebsiteContentServer()
  if (content?.seo) {
    if (content.seo.allowIndexing !== undefined) {
      allowIndexing = Boolean(content.seo.allowIndexing)
    }
    if (content.seo.canonicalUrl) {
      baseUrl = content.seo.canonicalUrl.replace(/\/$/, '')
    }
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: allowIndexing ? '/' : undefined,
        disallow: allowIndexing ? ['/admin/', '/api/', '/auth/'] : ['/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
