'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useWebsiteContent } from '@/hooks/use-website-content'
import { PageSeoMeta } from '@/lib/types/content'
import {
  getPageStructuredData,
  getBlogPostJsonLd,
  getProjectJsonLd,
  getServiceJsonLd,
  getTemplateJsonLd,
  getBreadcrumbJsonLd,
  getBaseUrl
} from '@/lib/structured-data'

export function SEOHead() {
  const pathname = usePathname()
  const { content } = useWebsiteContent()

  const seo = content?.seo
  const pages: Record<string, PageSeoMeta> = seo?.pages || {}
  const siteName = content?.general?.displayName || content?.general?.siteName || 'Linksys Fiber Networks'

  // 1. Check direct page static config
  let pageMeta: Partial<PageSeoMeta> | undefined = pages[pathname]
  let ogType = 'website'
  let dynamicNoIndex: boolean | undefined = undefined

  // Collection-specific structured data resolution
  let resolvedPrimarySchema: Record<string, any> | undefined = undefined
  let resolvedBreadcrumbSchema: Record<string, any> | undefined = undefined

  // 2. Dynamic Collection Route Resolution
  if (content && !pageMeta) {
    if (pathname.startsWith('/blog/')) {
      const slug = decodeURIComponent(pathname.replace('/blog/', ''))
      const post = content.blog?.posts?.find((p) => p.slug === slug || p.id === slug)
      if (post) {
        ogType = 'article'
        dynamicNoIndex = post.seo?.noIndex || (!post.published)
        pageMeta = {
          path: pathname,
          pageName: post.title,
          title: post.seo?.metaTitle
            ? `${post.seo.metaTitle} — ${siteName}`
            : `${post.title} — ${siteName}`,
          description:
            post.seo?.metaDescription ||
            post.excerpt ||
            (post.content ? post.content.replace(/<[^>]*>?/gm, '').slice(0, 160) : '') ||
            seo?.description ||
            '',
          keywords:
            post.seo?.keywords ||
            (post.category ? `${post.category}, Tech Blog, Web Engineering` : seo?.keywords || ''),
          ogImage: post.seo?.metaImage || post.coverImage || seo?.ogImage,
          canonicalUrl: post.seo?.canonicalUrl || (seo?.canonicalUrl ? `${seo.canonicalUrl}${pathname}` : undefined),
          noIndex: dynamicNoIndex,
        }
        resolvedPrimarySchema = getBlogPostJsonLd(post, content)
        resolvedBreadcrumbSchema = getBreadcrumbJsonLd(
          [
            { name: 'Home', path: '/' },
            { name: 'Blog', path: '/blog' },
            { name: post.title, path: pathname },
          ],
          content
        )
      }
    } else if (pathname.startsWith('/projects/')) {
      const id = decodeURIComponent(pathname.replace('/projects/', ''))
      const project = content.projects?.items?.find((p) => p.id === id || p.link === id)
      if (project) {
        dynamicNoIndex = project.seo?.noIndex
        pageMeta = {
          path: pathname,
          pageName: project.title,
          title: project.seo?.metaTitle
            ? `${project.seo.metaTitle} — ${siteName}`
            : `${project.title} — Case Study & Project Showcase`,
          description:
            project.seo?.metaDescription ||
            project.summary ||
            project.description ||
            seo?.description ||
            '',
          keywords:
            project.seo?.keywords ||
            (project.tags?.length ? `${project.tags.join(', ')}, Web Development, Portfolio` : seo?.keywords || ''),
          ogImage: project.seo?.metaImage || project.image || seo?.ogImage,
          canonicalUrl: project.seo?.canonicalUrl || (seo?.canonicalUrl ? `${seo.canonicalUrl}${pathname}` : undefined),
          noIndex: dynamicNoIndex,
        }
        resolvedPrimarySchema = getProjectJsonLd(project, content)
        resolvedBreadcrumbSchema = getBreadcrumbJsonLd(
          [
            { name: 'Home', path: '/' },
            { name: 'Projects', path: '/projects' },
            { name: project.title, path: pathname },
          ],
          content
        )
      }
    } else if (pathname.startsWith('/services/')) {
      const id = decodeURIComponent(pathname.replace('/services/', ''))
      const service = content.services?.items?.find((s) => s.id === id)
      if (service) {
        dynamicNoIndex = service.seo?.noIndex
        pageMeta = {
          path: pathname,
          pageName: service.title,
          title: service.seo?.metaTitle
            ? `${service.seo.metaTitle} — ${siteName}`
            : `${service.title} — Engineering & Design Services`,
          description:
            service.seo?.metaDescription ||
            service.summary ||
            service.description ||
            seo?.description ||
            '',
          keywords:
            service.seo?.keywords ||
            (service.features?.length ? `${service.features.join(', ')}, Consulting` : seo?.keywords || ''),
          ogImage: service.seo?.metaImage || seo?.ogImage,
          canonicalUrl: service.seo?.canonicalUrl || (seo?.canonicalUrl ? `${seo.canonicalUrl}${pathname}` : undefined),
          noIndex: dynamicNoIndex,
        }
        resolvedPrimarySchema = getServiceJsonLd(service, content)
        resolvedBreadcrumbSchema = getBreadcrumbJsonLd(
          [
            { name: 'Home', path: '/' },
            { name: 'Services', path: '/services' },
            { name: service.title, path: pathname },
          ],
          content
        )
      }
    } else if (pathname.startsWith('/templates/')) {
      const id = decodeURIComponent(pathname.replace('/templates/', ''))
      const template = content.templates?.items?.find((t) => t.id === id || t.slug === id)
      if (template) {
        dynamicNoIndex = template.seo?.noIndex
        pageMeta = {
          path: pathname,
          pageName: template.title,
          title: template.seo?.metaTitle
            ? `${template.seo.metaTitle} — ${siteName}`
            : `${template.title} — Starter Kit & Template`,
          description:
            template.seo?.metaDescription ||
            template.summary ||
            template.description ||
            seo?.description ||
            '',
          keywords:
            template.seo?.keywords ||
            (template.tags?.length ? `${template.tags.join(', ')}, Boilerplate, Next.js Starter` : seo?.keywords || ''),
          ogImage: template.seo?.metaImage || template.previewImage || seo?.ogImage,
          canonicalUrl: template.seo?.canonicalUrl || (seo?.canonicalUrl ? `${seo.canonicalUrl}${pathname}` : undefined),
          noIndex: dynamicNoIndex,
        }
        resolvedPrimarySchema = getTemplateJsonLd(template, content)
        resolvedBreadcrumbSchema = getBreadcrumbJsonLd(
          [
            { name: 'Home', path: '/' },
            { name: 'Templates', path: '/templates' },
            { name: template.title, path: pathname },
          ],
          content
        )
      }
    }
  }

  // Fallback to page structured data resolver for core / custom pages
  if (content && !resolvedPrimarySchema) {
    const pageData = getPageStructuredData(pathname, content)
    resolvedPrimarySchema = pageData.primarySchema
    resolvedBreadcrumbSchema = pageData.breadcrumbSchema
  }

  // Fallback to home page config if nothing matched
  const activeMeta = pageMeta || pages['/']

  const activeTitle = activeMeta?.title || seo?.title || `${siteName} — Full-Stack Web Developer & Designer`
  const activeDesc = activeMeta?.description || seo?.description || ''
  const activeKeywords = activeMeta?.keywords || seo?.keywords || ''
  const activeOgImage = activeMeta?.ogImage || seo?.ogImage || ''
  const activeCanonical =
    activeMeta?.canonicalUrl ||
    (seo?.canonicalUrl ? `${seo.canonicalUrl}${pathname === '/' ? '' : pathname}` : '')
  const apis = seo?.apis

  useEffect(() => {
    if (!content || typeof document === 'undefined') return

    // Update document title
    if (activeTitle) {
      document.title = activeTitle
    }

    // Update or insert meta description
    let metaDesc = document.querySelector('meta[name="description"]')
    if (!metaDesc) {
      metaDesc = document.createElement('meta')
      metaDesc.setAttribute('name', 'description')
      document.head.appendChild(metaDesc)
    }
    metaDesc.setAttribute('content', activeDesc)

    // Update or insert meta keywords
    if (activeKeywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]')
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta')
        metaKeywords.setAttribute('name', 'keywords')
        document.head.appendChild(metaKeywords)
      }
      metaKeywords.setAttribute('content', activeKeywords)
    }

    // Update Canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]')
    if (activeCanonical) {
      if (!canonicalLink) {
        canonicalLink = document.createElement('link')
        canonicalLink.setAttribute('rel', 'canonical')
        document.head.appendChild(canonicalLink)
      }
      canonicalLink.setAttribute('href', activeCanonical)
    }

    // Update OpenGraph & Twitter tags
    const ogTags: Record<string, string> = {
      'og:site_name': siteName,
      'og:type': ogType,
      'og:title': activeTitle,
      'og:description': activeDesc,
      'og:image': activeOgImage,
      'og:url': activeCanonical || (typeof window !== 'undefined' ? window.location.href : ''),
      'twitter:card': seo?.twitterCard || 'summary_large_image',
      'twitter:title': activeTitle,
      'twitter:description': activeDesc,
      'twitter:image': activeOgImage,
    }

    Object.entries(ogTags).forEach(([property, value]) => {
      if (!value) return
      let tag =
        document.querySelector(`meta[property="${property}"]`) ||
        document.querySelector(`meta[name="${property}"]`)
      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute(property.startsWith('twitter:') ? 'name' : 'property', property)
        document.head.appendChild(tag)
      }
      tag.setAttribute('content', value)
    })

    // Update Google Site Verification
    if (apis?.googleSiteVerification) {
      let gTag = document.querySelector('meta[name="google-site-verification"]')
      if (!gTag) {
        gTag = document.createElement('meta')
        gTag.setAttribute('name', 'google-site-verification')
        document.head.appendChild(gTag)
      }
      gTag.setAttribute('content', apis.googleSiteVerification.replace('google-site-verification=', ''))
    }

    // Update Bing Verification
    if (apis?.bingVerification) {
      let bTag = document.querySelector('meta[name="msvalidate.01"]')
      if (!bTag) {
        bTag = document.createElement('meta')
        bTag.setAttribute('name', 'msvalidate.01')
        document.head.appendChild(bTag)
      }
      bTag.setAttribute('content', apis.bingVerification)
    }

    // Robots meta (noIndex check)
    let robotsTag = document.querySelector('meta[name="robots"]')
    if (!robotsTag) {
      robotsTag = document.createElement('meta')
      robotsTag.setAttribute('name', 'robots')
      document.head.appendChild(robotsTag)
    }
    const isNoIndex = activeMeta?.noIndex || seo?.allowIndexing === false
    robotsTag.setAttribute('content', isNoIndex ? 'noindex, nofollow' : 'index, follow')

    // Inject Primary Schema.org JSON-LD structured data into <head>
    if (resolvedPrimarySchema) {
      let schemaScript = document.getElementById('schema-structured-data')
      if (!schemaScript) {
        schemaScript = document.createElement('script')
        schemaScript.setAttribute('id', 'schema-structured-data')
        schemaScript.setAttribute('type', 'application/ld+json')
        document.head.appendChild(schemaScript)
      }
      schemaScript.textContent = JSON.stringify(resolvedPrimarySchema)
    }

    // Inject Breadcrumbs Schema.org JSON-LD
    let breadcrumbScript = document.getElementById('schema-breadcrumbs')
    if (resolvedBreadcrumbSchema) {
      if (!breadcrumbScript) {
        breadcrumbScript = document.createElement('script')
        breadcrumbScript.setAttribute('id', 'schema-breadcrumbs')
        breadcrumbScript.setAttribute('type', 'application/ld+json')
        document.head.appendChild(breadcrumbScript)
      }
      breadcrumbScript.textContent = JSON.stringify(resolvedBreadcrumbSchema)
    } else if (breadcrumbScript) {
      breadcrumbScript.remove()
    }
  }, [
    content,
    activeTitle,
    activeDesc,
    activeKeywords,
    activeOgImage,
    activeCanonical,
    ogType,
    apis,
    activeMeta,
    seo?.allowIndexing,
    seo?.twitterCard,
    siteName,
    pathname,
    resolvedPrimarySchema,
    resolvedBreadcrumbSchema,
  ])

  return null
}
