import { MetadataRoute } from 'next'
import { getWebsiteContentServer } from '@/lib/get-website-content'
import { WebsiteContent } from '@/lib/types/content'

export const dynamic = 'force-dynamic'
export const revalidate = 3600

function safeDate(dateStr?: string): Date {
  if (!dateStr) return new Date()
  const parsed = new Date(dateStr)
  return isNaN(parsed.getTime()) ? new Date() : parsed
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content: WebsiteContent | null = await getWebsiteContentServer()

  if (!content) {
    return []
  }

  // Global indexing check
  if (content.seo?.allowIndexing === false) {
    return []
  }

  const rawBase =
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://linksysfiber.ke'
  const baseUrl = rawBase.replace(/\/$/, '')
  const lastUpdated = safeDate(content.lastUpdated)

  const sitemapEntries: MetadataRoute.Sitemap = []

  // 1. Primary Core Pages
  const corePages: Array<{
    path: string
    changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
    priority: number
  }> = [
    { path: '/', changeFrequency: 'daily', priority: 1.0 },
    { path: '/projects', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/services', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/blog', changeFrequency: 'daily', priority: 0.9 },
    { path: '/careers', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/contact', changeFrequency: 'monthly', priority: 0.8 },
  ]

  const customPagesMap = content.seo?.pages || {}

  for (const page of corePages) {
    const pageMeta = customPagesMap[page.path]
    if (pageMeta?.noIndex) continue

    sitemapEntries.push({
      url: `${baseUrl}${page.path === '/' ? '' : page.path}`,
      lastModified: lastUpdated,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })
  }

  // 2. Custom Additional Pages (from CMS SEO Pages Map)
  for (const [path, pageMeta] of Object.entries(customPagesMap)) {
    if (
      corePages.some((c) => c.path === path) ||
      path.startsWith('/admin') ||
      path.startsWith('/auth') ||
      path.startsWith('/api') ||
      pageMeta.noIndex
    ) {
      continue
    }

    const cleanPath = path.startsWith('/') ? path : `/${path}`
    sitemapEntries.push({
      url: `${baseUrl}${cleanPath}`,
      lastModified: lastUpdated,
      changeFrequency: 'monthly',
      priority: 0.7,
    })
  }

  // 3. Dynamic Blog Articles
  const posts = content.blog?.posts || []
  for (const post of posts) {
    if (!post.published || post.seo?.noIndex) continue
    const slug = post.slug || post.id
    sitemapEntries.push({
      url: `${baseUrl}/blog/${slug}`,
      lastModified: safeDate(post.date || content.lastUpdated),
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  }

  // 4. Dynamic Projects
  const projects = content.projects?.items || []
  for (const project of projects) {
    if (project.seo?.noIndex) continue
    sitemapEntries.push({
      url: `${baseUrl}/projects/${project.id}`,
      lastModified: safeDate(project.completionDate || content.lastUpdated),
      changeFrequency: 'monthly',
      priority: 0.8,
    })
  }

  // 5. Dynamic Services
  const services = content.services?.items || []
  for (const service of services) {
    if (service.seo?.noIndex) continue
    sitemapEntries.push({
      url: `${baseUrl}/services/${service.id}`,
      lastModified: lastUpdated,
      changeFrequency: 'monthly',
      priority: 0.8,
    })
  }

  // 6. Dynamic Templates
  const templates = content.templates?.items || []
  for (const template of templates) {
    if (template.seo?.noIndex) continue
    const slug = template.slug || template.id
    sitemapEntries.push({
      url: `${baseUrl}/templates/${slug}`,
      lastModified: lastUpdated,
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  }

  return sitemapEntries
}
