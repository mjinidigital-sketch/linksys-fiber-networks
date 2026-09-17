import {
  WebsiteContent,
  BlogPostItem,
  ProjectItem,
  ServiceItem,
  TemplateItem,
  PageSeoMeta,
  CollectionItemSeo,
  CollectionStructuredDataType,
  PageStructuredDataType,
} from './types/content'
import {
  MAIN_LOCATION,
  PROFESSION_TITLE,
  getSchemaAreasServed,
  ALL_AREAS_SERVED_SUMMARY,
  KENYA_COUNTIES,
} from './data/locations'

/**
 * Validates a JSON-LD string to ensure it parses properly and has basic Schema.org properties.
 */
export function validateJsonLd(jsonStr: string): {
  valid: boolean
  error?: string
  parsed?: Record<string, any>
} {
  if (!jsonStr || !jsonStr.trim()) {
    return { valid: true, parsed: undefined }
  }

  try {
    const parsed = JSON.parse(jsonStr)

    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return {
        valid: false,
        error: 'JSON-LD must be a JSON object (or array of objects) with "@context" and "@type".',
      }
    }

    if (!parsed['@context']) {
      return {
        valid: false,
        error: 'Missing required "@context": "https://schema.org".',
      }
    }

    if (!parsed['@type']) {
      return {
        valid: false,
        error: 'Missing required "@type" (e.g. "WebSite", "Article", "Person").',
      }
    }

    return { valid: true, parsed }
  } catch (err: any) {
    return {
      valid: false,
      error: `JSON Syntax Error: ${err.message || 'Invalid JSON format'}`,
    }
  }
}

/**
 * Prettifies JSON-LD string with 2-space indentation.
 */
export function formatJsonLd(jsonStr: string): string {
  try {
    const obj = JSON.parse(jsonStr)
    return JSON.stringify(obj, null, 2)
  } catch {
    return jsonStr
  }
}

/**
 * Returns the canonical base URL
 */
export function getBaseUrl(content?: Partial<WebsiteContent>): string {
  return (
    content?.seo?.canonicalUrl?.replace(/\/$/, '') ||
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
    'https://linksysfiber.ke'
  )
}

/**
 * Generates automated BreadcrumbList schema
 */
export function getBreadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
  content?: Partial<WebsiteContent>
) {
  const baseUrl = getBaseUrl(content)

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.path.startsWith('http') ? item.path : `${baseUrl}${item.path.startsWith('/') ? '' : '/'}${item.path}`,
    })),
  }
}

/**
 * Generates Organization / LocalBusiness schema from ISP content
 */
export function getPersonJsonLd(content: WebsiteContent) {
  const baseUrl = getBaseUrl(content)
  const general = content.general
  const socials = content.contact?.socials || []

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    additionalType: 'https://schema.org/InternetServiceProvider',
    name: general.displayName || general.siteName || 'Linksys Fiber Networks',
    description: general.shortBio || content.seo.description,
    url: baseUrl,
    image: general.avatarUrl ? `${baseUrl}${general.avatarUrl.startsWith('/') ? '' : '/'}${general.avatarUrl}` : undefined,
    logo: `${baseUrl}/linksys-logo-final.webp`,
    email: general.email ? `mailto:${general.email}` : 'mailto:info@linksysfiber.ke',
    telephone: general.phone || '+254 713 366 366',
    priceRange: 'KSh 1,500 - KSh 4,000',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Generis Hotel Building, Ground Floor',
      addressLocality: 'Molo',
      addressRegion: 'Nakuru County',
      addressCountry: 'Kenya',
    },
    areaServed: getSchemaAreasServed(),
    sameAs: socials.map((s) => s.url).filter(Boolean),
    knowsAbout: [
      'Fiber Internet',
      'High-Speed Wi-Fi',
      'Hotspot Wi-Fi Broadcasting',
      'Structured Cabling',
      'CCTV Installation & Security Solutions',
      'Managed IT Support',
      ...(content.techStack?.items || []),
    ],
  }
}

/**
 * Generates WebSite schema with Person publisher for Home (/)
 */
export function getWebSiteJsonLd(content: WebsiteContent) {
  const baseUrl = getBaseUrl(content)
  const siteName = content.general.siteName || content.general.displayName || 'Linksys Fiber Networks'

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: baseUrl,
    description: content.seo.description,
    publisher: getPersonJsonLd(content),
    inLanguage: 'en-US',
  }
}

/**
 * Generates ContactPage schema
 */
export function getContactPageJsonLd(content: WebsiteContent) {
  const baseUrl = getBaseUrl(content)
  const general = content.general

  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: `Contact ${general.displayName || 'Linksys Fiber Networks'} — Internet Service Provider Molo`,
    description: content.contact?.subtitle || 'Contact Linksys Fiber Networks for fast, affordable fiber and Wi-Fi internet in Molo and environs.',
    url: `${baseUrl}/contact`,
    mainEntity: {
      '@type': 'LocalBusiness',
      additionalType: 'https://schema.org/InternetServiceProvider',
      name: general.displayName || 'Linksys Fiber Networks',
      email: general.email || 'info@linksysfiber.ke',
      telephone: general.phone || '+254 713 366 366',
      url: baseUrl,
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Generis Hotel Building, Ground Floor',
        addressLocality: 'Molo',
        addressRegion: 'Nakuru County',
        addressCountry: 'Kenya',
      },
      areaServed: getSchemaAreasServed(),
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Customer Support & Sales',
        email: general.email || 'info@linksysfiber.ke',
        telephone: general.phone || '+254 713 366 366',
        availableLanguage: ['English', 'Swahili'],
        areaServed: [
          'Molo CBD',
          'Tayari',
          'Moto',
          'Turi',
          'Kibunja',
          'Promise',
          '20 Acres',
          'Kenyatta 123',
          'Upperhill Estate',
          'Nakuru County',
        ],
      },
    },
  }
}

/**
 * Generates CollectionPage schema (for /blog, /projects, /services, /templates)
 */
export function getCollectionPageJsonLd(
  pageName: string,
  pagePath: string,
  items: Array<{ name: string; url: string; description?: string }>,
  content: WebsiteContent
) {
  const baseUrl = getBaseUrl(content)
  const fullUrl = `${baseUrl}${pagePath}`

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: pageName,
    url: fullUrl,
    description: content.seo?.pages?.[pagePath]?.description || content.seo.description,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.map((item, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: item.name,
        url: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url.startsWith('/') ? '' : '/'}${item.url}`,
        description: item.description || undefined,
      })),
    },
  }
}

/**
 * Generates Blog Article schema
 */
export function getBlogPostJsonLd(post: BlogPostItem, content: WebsiteContent) {
  // If custom JSON-LD is provided and valid, return it
  if (post.seo?.structuredDataCustomJson) {
    const custom = validateJsonLd(post.seo.structuredDataCustomJson)
    if (custom.valid && custom.parsed) return custom.parsed
  }

  const baseUrl = getBaseUrl(content)
  const postUrl = `${baseUrl}/blog/${post.slug || post.id}`
  const authorName = content.general?.displayName || 'Victor Maina'
  const type =
    post.seo?.structuredDataType && post.seo.structuredDataType !== 'default' && post.seo.structuredDataType !== 'Custom'
      ? post.seo.structuredDataType
      : 'BlogPosting'

  return {
    '@context': 'https://schema.org',
    '@type': type,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    headline: post.seo?.metaTitle || post.title,
    description: post.seo?.metaDescription || post.excerpt,
    image: post.seo?.metaImage || post.coverImage || undefined,
    datePublished: post.date,
    dateModified: content.lastUpdated || post.date,
    author: {
      '@type': 'Person',
      name: authorName,
      url: baseUrl,
    },
    publisher: {
      '@type': 'Person',
      name: authorName,
      url: baseUrl,
    },
    articleSection: post.category,
    keywords: post.seo?.keywords || post.category,
    inLanguage: 'en-US',
  }
}

/**
 * Generates Project schema
 */
export function getProjectJsonLd(project: ProjectItem, content: WebsiteContent) {
  if (project.seo?.structuredDataCustomJson) {
    const custom = validateJsonLd(project.seo.structuredDataCustomJson)
    if (custom.valid && custom.parsed) return custom.parsed
  }

  const baseUrl = getBaseUrl(content)
  const projectUrl = `${baseUrl}/projects/${project.id}`
  const authorName = content.general?.displayName || 'Victor Maina'

  const rawType = project.seo?.structuredDataType
  const type =
    rawType && rawType !== 'default' && rawType !== 'Custom'
      ? rawType
      : 'SoftwareApplication'

  if (type === 'CreativeWork') {
    return {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: project.seo?.metaTitle || project.title,
      description: project.seo?.metaDescription || project.summary || project.description,
      image: project.seo?.metaImage || project.image || undefined,
      creator: {
        '@type': 'Person',
        name: authorName,
        url: baseUrl,
      },
      genre: project.category || project.type,
      keywords: project.seo?.keywords || (project.tags?.length ? project.tags.join(', ') : undefined),
      url: project.liveUrl || projectUrl,
    }
  }

  return {
    '@context': 'https://schema.org',
    '@type': type, // SoftwareApplication or WebApplication
    name: project.seo?.metaTitle || project.title,
    description: project.seo?.metaDescription || project.summary || project.description,
    image: project.seo?.metaImage || project.image || undefined,
    applicationCategory: project.category || 'WebApplication',
    operatingSystem: 'Web Browser',
    author: {
      '@type': 'Person',
      name: authorName,
      url: baseUrl,
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    keywords: project.seo?.keywords || (project.tags?.length ? project.tags.join(', ') : undefined),
    url: project.liveUrl || projectUrl,
  }
}

/**
 * Generates Service schema
 */
export function getServiceJsonLd(service: ServiceItem, content: WebsiteContent) {
  if (service.seo?.structuredDataCustomJson) {
    const custom = validateJsonLd(service.seo.structuredDataCustomJson)
    if (custom.valid && custom.parsed) return custom.parsed
  }

  const baseUrl = getBaseUrl(content)
  const serviceUrl = `${baseUrl}/services/${service.id}`
  const providerName = content.general?.displayName || 'Victor Maina'

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.seo?.metaTitle || service.title,
    serviceType: 'Website Development & SEO Expert Services',
    description: service.seo?.metaDescription || service.summary || service.description,
    url: serviceUrl,
    provider: {
      '@type': 'Person',
      name: providerName,
      jobTitle: PROFESSION_TITLE,
      url: baseUrl,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Nairobi',
        addressCountry: 'Kenya',
      },
    },
    areaServed: getSchemaAreasServed(),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: service.title,
      itemListElement: (service.features || []).map((feat) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: feat,
        },
      })),
    },
  }
}

/**
 * Generates Template item schema
 */
export function getTemplateJsonLd(template: TemplateItem, content: WebsiteContent) {
  if (template.seo?.structuredDataCustomJson) {
    const custom = validateJsonLd(template.seo.structuredDataCustomJson)
    if (custom.valid && custom.parsed) return custom.parsed
  }

  const baseUrl = getBaseUrl(content)
  const templateUrl = `${baseUrl}/templates/${template.slug || template.id}`
  const authorName = content.general?.displayName || 'Victor Maina'
  const isProduct = template.seo?.structuredDataType === 'Product'

  if (isProduct) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: template.seo?.metaTitle || template.title,
      description: template.seo?.metaDescription || template.summary || template.description,
      image: template.seo?.metaImage || template.previewImage || undefined,
      category: template.category,
      brand: {
        '@type': 'Person',
        name: authorName,
      },
      offers: {
        '@type': 'Offer',
        price: template.price?.toLowerCase().includes('free') ? '0' : template.price || '0',
        priceCurrency: 'USD',
        url: templateUrl,
      },
    }
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: template.seo?.metaTitle || template.title,
    description: template.seo?.metaDescription || template.summary || template.description,
    image: template.seo?.metaImage || template.previewImage || undefined,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Cross-platform',
    author: {
      '@type': 'Person',
      name: authorName,
      url: baseUrl,
    },
    offers: {
      '@type': 'Offer',
      price: template.price?.toLowerCase().includes('free') ? '0' : template.price || '0',
      priceCurrency: 'USD',
      url: templateUrl,
    },
    keywords: template.seo?.keywords || (template.tags?.length ? template.tags.join(', ') : undefined),
  }
}

/**
 * Unified resolver for any page route
 */
export function getPageStructuredData(
  path: string,
  content: WebsiteContent
): {
  primarySchema: Record<string, any>
  breadcrumbSchema?: Record<string, any>
} {
  const pages = content.seo?.pages || {}
  const pageMeta: PageSeoMeta | undefined = pages[path]

  // Check custom override for this page
  if (pageMeta?.structuredDataCustomJson) {
    const validated = validateJsonLd(pageMeta.structuredDataCustomJson)
    if (validated.valid && validated.parsed) {
      return {
        primarySchema: validated.parsed,
        breadcrumbSchema: getBreadcrumbForPath(path, pageMeta.pageName, content),
      }
    }
  }

  // Handle explicitly chosen structuredDataType on pageMeta
  if (pageMeta?.structuredDataType && pageMeta.structuredDataType !== 'default' && pageMeta.structuredDataType !== 'Custom') {
    const baseUrl = getBaseUrl(content)
    const customType = pageMeta.structuredDataType

    if (customType === 'WebSite') {
      return {
        primarySchema: getWebSiteJsonLd(content),
        breadcrumbSchema: getBreadcrumbForPath(path, pageMeta.pageName, content),
      }
    }

    if (customType === 'LocalBusiness' || customType === 'Organization') {
      return {
        primarySchema: getPersonJsonLd(content),
        breadcrumbSchema: getBreadcrumbForPath(path, pageMeta.pageName, content),
      }
    }

    if (customType === 'Product') {
      return {
        primarySchema: {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: pageMeta.title,
          description: pageMeta.description,
          image: pageMeta.ogImage || content.seo.ogImage,
          brand: {
            '@type': 'Organization',
            name: content.general.displayName || content.general.siteName || 'Linksys Fiber Networks',
          },
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'KES',
            lowPrice: '1500',
            highPrice: '4000',
            offerCount: content.pricing?.plans?.length || 4,
            offers: (content.pricing?.plans || []).map((t) => ({
              '@type': 'Offer',
              name: t.name,
              price: t.price,
              priceCurrency: 'KES',
              url: `${baseUrl}/packages`,
            })),
          },
        },
        breadcrumbSchema: getBreadcrumbForPath(path, pageMeta.pageName, content),
      }
    }

    if (customType === 'Service') {
      return {
        primarySchema: {
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: pageMeta.title,
          description: pageMeta.description,
          provider: getPersonJsonLd(content),
          areaServed: getSchemaAreasServed(),
          url: `${baseUrl}${path}`,
        },
        breadcrumbSchema: getBreadcrumbForPath(path, pageMeta.pageName, content),
      }
    }

    if (customType === 'Article') {
      return {
        primarySchema: {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: pageMeta.title,
          description: pageMeta.description,
          image: pageMeta.ogImage || content.seo.ogImage,
          author: getPersonJsonLd(content),
          publisher: getPersonJsonLd(content),
          url: `${baseUrl}${path}`,
        },
        breadcrumbSchema: getBreadcrumbForPath(path, pageMeta.pageName, content),
      }
    }

    if (customType === 'ProfilePage' || customType === 'AboutPage') {
      return {
        primarySchema: {
          '@context': 'https://schema.org',
          '@type': customType,
          name: pageMeta.title,
          description: pageMeta.description,
          url: `${baseUrl}${path}`,
          mainEntity: getPersonJsonLd(content),
        },
        breadcrumbSchema: getBreadcrumbForPath(path, pageMeta.pageName, content),
      }
    }

    if (customType === 'ContactPage') {
      return {
        primarySchema: getContactPageJsonLd(content),
        breadcrumbSchema: getBreadcrumbForPath(path, pageMeta.pageName, content),
      }
    }

    if (customType === 'FAQPage' && content.faq?.items?.length) {
      return {
        primarySchema: {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          name: pageMeta.title || content.faq.title,
          mainEntity: content.faq.items.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.answer,
            },
          })),
        },
        breadcrumbSchema: getBreadcrumbForPath(path, pageMeta.pageName, content),
      }
    }

    return {
      primarySchema: {
        '@context': 'https://schema.org',
        '@type': customType,
        name: pageMeta.title,
        description: pageMeta.description,
        url: `${baseUrl}${path}`,
      },
      breadcrumbSchema: getBreadcrumbForPath(path, pageMeta.pageName, content),
    }
  }

  // Built-in Defaults by standard route
  if (path === '/') {
    return {
      primarySchema: getWebSiteJsonLd(content),
    }
  }

  if (path === '/blog') {
    const posts = (content.blog?.posts || [])
      .filter((p) => p.published)
      .map((p) => ({
        name: p.title,
        url: `/blog/${p.slug || p.id}`,
        description: p.excerpt,
      }))
    return {
      primarySchema: getCollectionPageJsonLd('Blog & Technical Articles', '/blog', posts, content),
      breadcrumbSchema: getBreadcrumbForPath('/blog', 'Blog', content),
    }
  }

  if (path === '/projects') {
    const projects = (content.projects?.items || []).map((p) => ({
      name: p.title,
      url: `/projects/${p.id}`,
      description: p.summary || p.description,
    }))
    return {
      primarySchema: getCollectionPageJsonLd('Projects & Portfolio Showcase', '/projects', projects, content),
      breadcrumbSchema: getBreadcrumbForPath('/projects', 'Projects', content),
    }
  }

  if (path === '/services') {
    const services = (content.services?.items || []).map((s) => ({
      name: s.title,
      url: `/services/${s.id}`,
      description: s.summary || s.description,
    }))
    return {
      primarySchema: getCollectionPageJsonLd('Engineering & Design Services', '/services', services, content),
      breadcrumbSchema: getBreadcrumbForPath('/services', 'Services', content),
    }
  }

  if (path === '/templates') {
    const templates = (content.templates?.items || []).map((t) => ({
      name: t.title,
      url: `/templates/${t.slug || t.id}`,
      description: t.summary || t.description,
    }))
    return {
      primarySchema: getCollectionPageJsonLd('Starter Kits & Web Templates', '/templates', templates, content),
      breadcrumbSchema: getBreadcrumbForPath('/templates', 'Templates', content),
    }
  }

  if (path === '/contact') {
    return {
      primarySchema: getContactPageJsonLd(content),
      breadcrumbSchema: getBreadcrumbForPath('/contact', 'Contact', content),
    }
  }

  // Fallback for custom page paths
  const baseUrl = getBaseUrl(content)
  return {
    primarySchema: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: pageMeta?.title || content.seo.title,
      description: pageMeta?.description || content.seo.description,
      url: `${baseUrl}${path}`,
    },
    breadcrumbSchema: getBreadcrumbForPath(path, pageMeta?.pageName || 'Page', content),
  }
}

function getBreadcrumbForPath(
  path: string,
  name: string,
  content: WebsiteContent
) {
  if (path === '/') return undefined
  return getBreadcrumbJsonLd(
    [
      { name: 'Home', path: '/' },
      { name, path },
    ],
    content
  )
}

/**
 * Returns a ready-to-edit JSON-LD template string for manual configuration
 */
export function getDefaultSchemaTemplate(
  type: string,
  params: {
    title?: string
    description?: string
    url?: string
    image?: string
    siteName?: string
  } = {}
): string {
  const {
    title = 'Example Title',
    description = 'Example description summarizing this content.',
    url = 'https://linksysfiber.ke/packages',
    image = 'https://linksysfiber.ke/api/media/file/hero-linksys%20(1)-2-1200x630.webp',
    siteName = 'Linksys Fiber Networks',
  } = params

  switch (type) {
    case 'WebSite':
      return JSON.stringify(
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: siteName,
          url,
          description,
        },
        null,
        2
      )

    case 'BlogPosting':
    case 'Article':
    case 'TechArticle':
      return JSON.stringify(
        {
          '@context': 'https://schema.org',
          '@type': type,
          headline: title,
          description,
          image,
          datePublished: new Date().toISOString().split('T')[0],
          author: {
            '@type': 'Person',
            name: siteName,
          },
          publisher: {
            '@type': 'Person',
            name: siteName,
          },
        },
        null,
        2
      )

    case 'SoftwareApplication':
    case 'WebApplication':
      return JSON.stringify(
        {
          '@context': 'https://schema.org',
          '@type': type,
          name: title,
          description,
          image,
          applicationCategory: 'WebApplication',
          operatingSystem: 'Web Browser',
          author: {
            '@type': 'Person',
            name: siteName,
          },
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
        },
        null,
        2
      )

    case 'Service':
      return JSON.stringify(
        {
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: title,
          description,
          provider: {
            '@type': 'Person',
            name: siteName,
          },
          areaServed: 'Worldwide',
        },
        null,
        2
      )

    case 'Product':
      return JSON.stringify(
        {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: title,
          description,
          image,
          offers: {
            '@type': 'Offer',
            price: '49',
            priceCurrency: 'USD',
          },
        },
        null,
        2
      )

    case 'LocalBusiness':
    case 'Organization':
      return JSON.stringify(
        {
          '@context': 'https://schema.org',
          '@type': type,
          name: siteName,
          description,
          url,
          logo: image,
          telephone: '+254 713 366 366',
          email: 'info@linksysfiber.ke',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Generis Hotel Building, Ground Floor',
            addressLocality: 'Molo',
            addressRegion: 'Nakuru County',
            addressCountry: 'Kenya',
          },
          priceRange: 'KSh 1,500 - KSh 4,000',
        },
        null,
        2
      )

    case 'ProfilePage':
    case 'AboutPage':
      return JSON.stringify(
        {
          '@context': 'https://schema.org',
          '@type': type,
          name: title,
          description,
          url,
          mainEntity: {
            '@type': 'Person',
            name: siteName,
            jobTitle: 'Full-Stack Web Developer',
          },
        },
        null,
        2
      )

    case 'ContactPage':
      return JSON.stringify(
        {
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          name: title,
          description,
          url,
        },
        null,
        2
      )

    case 'FAQPage':
      return JSON.stringify(
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'What services do you provide?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Full-stack development, modern web applications, and consulting.',
              },
            },
          ],
        },
        null,
        2
      )

    default:
      return JSON.stringify(
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: title,
          description,
          url,
        },
        null,
        2
      )
  }
}
