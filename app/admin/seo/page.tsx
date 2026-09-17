'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Search,
  Save,
  Globe,
  Shield,
  Sparkles,
  Layers,
  FileCode2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ExternalLink,
  Plus,
  Trash2,
  BarChart3,
  Bot,
  Activity,
  Code2,
  Radio,
  Share2,
  RefreshCw,
  Copy,
  Check,
  RotateCcw,
  FileText,
  Briefcase,
  Wrench,
  LayoutTemplate,
  ShieldCheck,
  Eye
} from 'lucide-react'
import { useWebsiteContent } from '@/hooks/use-website-content'
import { useToast } from '@/components/ui/toast'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ImageUploader } from '@/components/ui/image-uploader'
import { PageSeoMeta, ExternalSeoApis, PageStructuredDataType } from '@/lib/types/content'
import {
  validateJsonLd,
  formatJsonLd,
  getDefaultSchemaTemplate,
  getPageStructuredData,
  getBaseUrl
} from '@/lib/structured-data'

const defaultPagesMap: Record<string, PageSeoMeta> = {
  '/': {
    path: '/',
    pageName: 'Home Page',
    title: 'Linksys Fiber Networks — Fast & Reliable Internet in Molo',
    description: 'Linksys is a trusted internet service provider in Molo offering fast, reliable, and affordable fiber and Wi-Fi for homes and businesses.',
    keywords: 'Linksys Fiber Networks, Molo Internet Provider, Fast WiFi Molo, Fiber Internet Nakuru, Affordable Home Internet',
    canonicalUrl: 'https://linksysfiber.ke/',
    noIndex: false,
    structuredDataType: 'WebSite',
  },
  '/packages': {
    path: '/packages',
    pageName: 'Internet Packages',
    title: 'Internet Packages & Pricing — Linksys Fiber Networks',
    description: 'Explore unlimited high-speed fiber and Wi-Fi internet packages in Molo starting from KSh 1,500/mo.',
    keywords: 'Internet packages Molo, Unlimited WiFi, Home Fiber packages, Business internet Molo',
    canonicalUrl: 'https://linksysfiber.ke/packages',
    noIndex: false,
    structuredDataType: 'Product',
  },
  '/services': {
    path: '/services',
    pageName: 'Services & Solutions',
    title: 'Services & IT Solutions — Linksys Fiber Networks',
    description: 'High-speed fiber installation, hotspot broadcasting, CCTV setup, and managed IT networking in Molo and environs.',
    keywords: 'Fiber installation Molo, CCTV security Molo, Hotspot Wi-Fi, Structured cabling',
    canonicalUrl: 'https://linksysfiber.ke/services',
    noIndex: false,
    structuredDataType: 'Service',
  },
  '/projects': {
    path: '/projects',
    pageName: 'Deployments & Case Studies',
    title: 'Featured Deployments — Linksys Fiber Networks',
    description: 'Explore successful network installations, commercial deployments, and community Wi-Fi projects across Molo.',
    keywords: 'Network installations Molo, Case studies, Wi-Fi projects Kenya',
    canonicalUrl: 'https://linksysfiber.ke/projects',
    noIndex: false,
    structuredDataType: 'CollectionPage',
  },
  '/blog': {
    path: '/blog',
    pageName: 'Blog & Articles',
    title: 'News & Tech Tips — Linksys Fiber Networks',
    description: 'Stay updated with internet tips, troubleshooting advice, and tech announcements from Linksys.',
    keywords: 'Internet tips, Wi-Fi troubleshooting, Fiber news Molo',
    canonicalUrl: 'https://linksysfiber.ke/blog',
    noIndex: false,
    structuredDataType: 'CollectionPage',
  },
  '/careers': {
    path: '/careers',
    pageName: 'Careers & Jobs',
    title: 'Careers & Opportunities — Linksys Fiber Networks',
    description: 'Join our growing team at Linksys Fiber Networks. Explore open positions in networking, sales, and support.',
    keywords: 'Jobs in Molo, Telecom careers Kenya, IT technician jobs Nakuru',
    canonicalUrl: 'https://linksysfiber.ke/careers',
    noIndex: false,
    structuredDataType: 'WebPage',
  },
  '/contact': {
    path: '/contact',
    pageName: 'Contact & Support',
    title: 'Contact Us & Get Connected — Linksys Fiber Networks',
    description: 'Contact Linksys Fiber Networks for immediate installation, customer support, or technical inquiries in Molo.',
    keywords: 'Contact Linksys, Internet support Molo, Generis Hotel Building, Customer care',
    canonicalUrl: 'https://linksysfiber.ke/contact',
    noIndex: false,
    structuredDataType: 'ContactPage',
  },
}

export default function SeoAdminPage() {
  const { content, setContent, saving, saveAll } = useWebsiteContent()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState<'pages' | 'global' | 'sitemap' | 'apis' | 'audit'>('pages')
  const [pageSubTab, setPageSubTab] = useState<'meta' | 'schema'>('meta')
  const [selectedPath, setSelectedPath] = useState<string>('/')
  const [newPagePath, setNewPagePath] = useState('')
  const [newPageName, setNewPageName] = useState('')
  const [sitemapFilter, setSitemapFilter] = useState<'all' | 'pages' | 'blog' | 'projects' | 'services' | 'templates' | 'excluded'>('all')
  const [copiedSchema, setCopiedSchema] = useState(false)

  // Ensure pages and apis structures exist
  const pagesMap = content.seo?.pages && Object.keys(content.seo.pages).length > 0
    ? content.seo.pages
    : defaultPagesMap

  const apisSettings: ExternalSeoApis = content.seo?.apis || {
    googleSiteVerification: '',
    googleAnalyticsId: '',
    googleTagManagerId: '',
    bingVerification: '',
    customHeadScript: '',
  }

  const activePageMeta: PageSeoMeta = pagesMap[selectedPath] || {
    path: selectedPath,
    pageName: 'Custom Page',
    title: content.seo.title,
    description: content.seo.description,
    keywords: content.seo.keywords,
    canonicalUrl: `${content.seo.canonicalUrl}${selectedPath === '/' ? '' : selectedPath}`,
    noIndex: false,
  }

  const handleSave = async () => {
    const updatedContent = {
      ...content,
      seo: {
        ...content.seo,
        pages: pagesMap,
        apis: apisSettings,
      },
    }
    const res = await saveAll(updatedContent)
    if (res?.success) {
      toast({
        type: 'success',
        title: 'SEO Settings Saved',
        description: 'All page-level metadata, Schema.org structured data, and external SEO APIs updated.',
      })
    }
  }

  const updateSelectedPage = (fields: Partial<PageSeoMeta>) => {
    const updatedPages = {
      ...pagesMap,
      [selectedPath]: {
        ...activePageMeta,
        ...fields,
      },
    }
    setContent({
      ...content,
      seo: {
        ...content.seo,
        pages: updatedPages,
      },
    })
  }

  const updateApis = (fields: Partial<ExternalSeoApis>) => {
    setContent({
      ...content,
      seo: {
        ...content.seo,
        apis: {
          ...apisSettings,
          ...fields,
        },
      },
    })
  }

  const handleAddPage = () => {
    if (!newPagePath.trim() || !newPageName.trim()) {
      toast({
        type: 'error',
        title: 'Invalid Route',
        description: 'Please specify route path and page title.',
      })
      return
    }

    const path = newPagePath.startsWith('/') ? newPagePath.trim() : `/${newPagePath.trim()}`
    const updatedPages = {
      ...pagesMap,
      [path]: {
        path,
        pageName: newPageName.trim(),
        title: `${newPageName.trim()} — ${content.general.displayName}`,
        description: content.seo.description,
        keywords: content.seo.keywords,
        canonicalUrl: `${content.seo.canonicalUrl}${path}`,
        noIndex: false,
        structuredDataType: 'WebPage' as PageStructuredDataType,
      },
    }

    setContent({
      ...content,
      seo: {
        ...content.seo,
        pages: updatedPages,
      },
    })

    setSelectedPath(path)
    setNewPagePath('')
    setNewPageName('')
    toast({
      type: 'success',
      title: 'Page Meta Added',
      description: `Configured metadata route for ${path}`,
    })
  }

  const handleDeletePage = (path: string) => {
    if (path === '/') return
    const updated = { ...pagesMap }
    delete updated[path]
    setContent({
      ...content,
      seo: {
        ...content.seo,
        pages: updated,
      },
    })
    setSelectedPath('/')
  }

  // Schema generation for active page
  const activePageStructuredData = useMemo(() => {
    return getPageStructuredData(selectedPath, content)
  }, [selectedPath, content])

  const activePageSchemaString = useMemo(() => {
    return JSON.stringify(activePageStructuredData.primarySchema, null, 2)
  }, [activePageStructuredData])

  const pageSchemaValidation = useMemo(() => {
    if (!activePageMeta.structuredDataCustomJson) return { valid: true }
    return validateJsonLd(activePageMeta.structuredDataCustomJson)
  }, [activePageMeta.structuredDataCustomJson])

  const handlePreloadPageTemplate = () => {
    const type = activePageMeta.structuredDataType || 'WebPage'
    const template = getDefaultSchemaTemplate(type, {
      title: activePageMeta.title || content.seo.title,
      description: activePageMeta.description || content.seo.description,
      url: `${getBaseUrl(content)}${selectedPath === '/' ? '' : selectedPath}`,
      image: activePageMeta.ogImage || content.seo.ogImage,
      siteName: content.general.displayName,
    })
    updateSelectedPage({ structuredDataCustomJson: template })
  }

  const handleFormatPageJson = () => {
    if (!activePageMeta.structuredDataCustomJson) return
    const formatted = formatJsonLd(activePageMeta.structuredDataCustomJson)
    updateSelectedPage({ structuredDataCustomJson: formatted })
  }

  const handleCopyPageSchema = () => {
    navigator.clipboard.writeText(activePageSchemaString)
    setCopiedSchema(true)
    setTimeout(() => setCopiedSchema(false), 2000)
  }

  // Generate All Sitemap Items list for Sitemap Tab
  const allSitemapItems = useMemo(() => {
    const items: Array<{
      url: string
      path: string
      name: string
      type: 'Core Page' | 'Custom Page' | 'Blog Post' | 'Project' | 'Service' | 'Template'
      priority: number
      changeFrequency: string
      isIndexed: boolean
      reason?: string
    }> = []

    const baseUrl = getBaseUrl(content)

    // 1. Core Pages
    const coreRoutes = [
      { path: '/', name: 'Home Page', freq: 'daily', pri: 1.0 },
      { path: '/projects', name: 'Projects Portfolio', freq: 'weekly', pri: 0.9 },
      { path: '/services', name: 'Services & Offerings', freq: 'weekly', pri: 0.9 },
      { path: '/blog', name: 'Blog & Articles', freq: 'daily', pri: 0.9 },
      { path: '/templates', name: 'Templates & Starters', freq: 'weekly', pri: 0.8 },
      { path: '/contact', name: 'Contact & Hire', freq: 'monthly', pri: 0.8 },
    ]

    for (const cr of coreRoutes) {
      const pm = pagesMap[cr.path]
      const isIndexed = !pm?.noIndex && content.seo.allowIndexing !== false
      items.push({
        url: `${baseUrl}${cr.path === '/' ? '' : cr.path}`,
        path: cr.path,
        name: pm?.pageName || cr.name,
        type: 'Core Page',
        priority: cr.pri,
        changeFrequency: cr.freq,
        isIndexed,
        reason: pm?.noIndex ? 'Marked noindex' : undefined,
      })
    }

    // 2. Custom Pages
    for (const [p, pm] of Object.entries(pagesMap)) {
      if (coreRoutes.some((c) => c.path === p)) continue
      const isIndexed = !pm.noIndex && content.seo.allowIndexing !== false
      items.push({
        url: `${baseUrl}${p}`,
        path: p,
        name: pm.pageName,
        type: 'Custom Page',
        priority: 0.7,
        changeFrequency: 'monthly',
        isIndexed,
        reason: pm.noIndex ? 'Marked noindex' : undefined,
      })
    }

    // 3. Blog Posts
    for (const post of content.blog?.posts || []) {
      const isIndexed = Boolean(post.published && !post.seo?.noIndex && content.seo.allowIndexing !== false)
      items.push({
        url: `${baseUrl}/blog/${post.slug || post.id}`,
        path: `/blog/${post.slug || post.id}`,
        name: post.title,
        type: 'Blog Post',
        priority: 0.8,
        changeFrequency: 'weekly',
        isIndexed,
        reason: !post.published ? 'Draft (Unpublished)' : post.seo?.noIndex ? 'Marked noindex' : undefined,
      })
    }

    // 4. Projects
    for (const proj of content.projects?.items || []) {
      const isIndexed = Boolean(!proj.seo?.noIndex && content.seo.allowIndexing !== false)
      items.push({
        url: `${baseUrl}/projects/${proj.id}`,
        path: `/projects/${proj.id}`,
        name: proj.title,
        type: 'Project',
        priority: 0.8,
        changeFrequency: 'monthly',
        isIndexed,
        reason: proj.seo?.noIndex ? 'Marked noindex' : undefined,
      })
    }

    // 5. Services
    for (const serv of content.services?.items || []) {
      const isIndexed = Boolean(!serv.seo?.noIndex && content.seo.allowIndexing !== false)
      items.push({
        url: `${baseUrl}/services/${serv.id}`,
        path: `/services/${serv.id}`,
        name: serv.title,
        type: 'Service',
        priority: 0.8,
        changeFrequency: 'monthly',
        isIndexed,
        reason: serv.seo?.noIndex ? 'Marked noindex' : undefined,
      })
    }

    // 6. Templates
    for (const tmpl of content.templates?.items || []) {
      const isIndexed = Boolean(!tmpl.seo?.noIndex && content.seo.allowIndexing !== false)
      items.push({
        url: `${baseUrl}/templates/${tmpl.slug || tmpl.id}`,
        path: `/templates/${tmpl.slug || tmpl.id}`,
        name: tmpl.title,
        type: 'Template',
        priority: 0.8,
        changeFrequency: 'weekly',
        isIndexed,
        reason: tmpl.seo?.noIndex ? 'Marked noindex' : undefined,
      })
    }

    return items
  }, [content, pagesMap])

  const filteredSitemapItems = useMemo(() => {
    if (sitemapFilter === 'all') return allSitemapItems
    if (sitemapFilter === 'pages') return allSitemapItems.filter((i) => i.type === 'Core Page' || i.type === 'Custom Page')
    if (sitemapFilter === 'blog') return allSitemapItems.filter((i) => i.type === 'Blog Post')
    if (sitemapFilter === 'projects') return allSitemapItems.filter((i) => i.type === 'Project')
    if (sitemapFilter === 'services') return allSitemapItems.filter((i) => i.type === 'Service')
    if (sitemapFilter === 'templates') return allSitemapItems.filter((i) => i.type === 'Template')
    if (sitemapFilter === 'excluded') return allSitemapItems.filter((i) => !i.isIndexed)
    return allSitemapItems
  }, [allSitemapItems, sitemapFilter])

  const indexedCount = allSitemapItems.filter((i) => i.isIndexed).length
  const excludedCount = allSitemapItems.length - indexedCount

  // SEO Score calculation
  const titleLen = activePageMeta.title?.length || 0
  const descLen = activePageMeta.description?.length || 0
  const hasOgImage = Boolean(activePageMeta.ogImage || content.seo.ogImage)
  const hasGoogleVerification = Boolean(apisSettings.googleSiteVerification)
  const hasGA = Boolean(apisSettings.googleAnalyticsId)

  let score = 40
  if (titleLen >= 35 && titleLen <= 65) score += 20
  if (descLen >= 120 && descLen <= 165) score += 20
  if (hasOgImage) score += 10
  if (hasGoogleVerification || hasGA) score += 10

  return (
    <div className="mx-auto max-w-6xl w-full min-w-0 overflow-x-hidden space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="accent">Search & Meta Hub</Badge>
            <span className="font-mono text-xs text-muted-foreground">Convex Realtime DB</span>
          </div>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight">
            SEO, Sitemap.xml & Structured Data
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage page-by-page metadata, Schema.org JSON-LD structured data, dynamic XML sitemaps, and search engine integrations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-2 rounded-xl border border-border bg-card/60 hover:bg-muted text-foreground transition-colors"
          >
            <FileCode2 className="size-3.5 text-primary" />
            <span>sitemap.xml</span>
            <ExternalLink className="size-3 text-muted-foreground" />
          </a>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl shadow-lg shadow-primary/20 bg-primary font-semibold text-primary-foreground"
          >
            <Save className="size-4 mr-1.5" />
            {saving ? 'Saving...' : 'Save All SEO Settings'}
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
        <TabsList className="flex flex-wrap sm:grid sm:grid-cols-5 w-full rounded-2xl bg-muted/60 p-1 gap-1">
          <TabsTrigger value="pages" className="rounded-xl text-xs font-semibold">
            <Layers className="size-3.5 mr-1.5" />
            Page Meta & Schema
          </TabsTrigger>
          <TabsTrigger value="sitemap" className="rounded-xl text-xs font-semibold">
            <FileCode2 className="size-3.5 mr-1.5" />
            Sitemap & Crawl
          </TabsTrigger>
          <TabsTrigger value="global" className="rounded-xl text-xs font-semibold">
            <Globe className="size-3.5 mr-1.5" />
            Global Defaults
          </TabsTrigger>
          <TabsTrigger value="apis" className="rounded-xl text-xs font-semibold">
            <Code2 className="size-3.5 mr-1.5" />
            Google & Search APIs
          </TabsTrigger>
          <TabsTrigger value="audit" className="rounded-xl text-xs font-semibold">
            <Activity className="size-3.5 mr-1.5" />
            Health & Preview
          </TabsTrigger>
        </TabsList>

        {/* 1. Page-by-Page Metadata Tab */}
        <TabsContent value="pages" className="mt-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
            {/* Page Selector Sidebar */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-bold flex items-center justify-between">
                    <span>Website Routes</span>
                    <Badge variant="secondary" className="font-mono text-[10px]">
                      {Object.keys(pagesMap).length} Pages
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 space-y-1">
                  {Object.entries(pagesMap).map(([path, p]) => (
                    <button
                      key={path}
                      onClick={() => setSelectedPath(path)}
                      className={`w-full text-left rounded-xl p-3 text-xs transition-all flex items-center justify-between ${
                        selectedPath === path
                          ? 'bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20'
                          : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <div>
                        <p className="font-bold">{p.pageName}</p>
                        <p className={`font-mono text-[10px] mt-0.5 ${selectedPath === path ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                          {path}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {p.noIndex && (
                          <Badge variant="destructive" className="text-[9px] uppercase">
                            noindex
                          </Badge>
                        )}
                        {p.structuredDataType && (
                          <span className={`text-[9px] font-mono ${selectedPath === path ? 'text-primary-foreground/70' : 'text-primary'}`}>
                            @{p.structuredDataType}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* Add Custom Route Card */}
              <Card className="p-4 space-y-3">
                <p className="text-xs font-bold">Add Custom Page Meta</p>
                <div className="space-y-2">
                  <Input
                    placeholder="Page Name (e.g. Case Study)"
                    value={newPageName}
                    onChange={(e) => setNewPageName(e.target.value)}
                    className="text-xs h-8"
                  />
                  <Input
                    placeholder="Route path (e.g. /case-study)"
                    value={newPagePath}
                    onChange={(e) => setNewPagePath(e.target.value)}
                    className="text-xs h-8 font-mono"
                  />
                  <Button size="sm" variant="outline" className="w-full text-xs h-8" onClick={handleAddPage}>
                    <Plus className="size-3.5 mr-1" /> Add Page
                  </Button>
                </div>
              </Card>

              {/* Collections Dynamic SEO Hub */}
              <Card className="p-4 space-y-3 bg-card/60 border-primary/20">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-primary" />
                    <span>Collections SEO & Schema</span>
                  </p>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    Dynamic
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Individual items have their own dedicated SEO and Schema.org JSON-LD settings right in their collection managers.
                </p>
                <div className="space-y-1.5 pt-1">
                  <Link
                    href="/admin/website-content/collections/blog"
                    className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/40 hover:bg-muted transition-colors font-medium"
                  >
                    <span>Blog Collection ({content.blog?.posts?.length || 0})</span>
                    <ExternalLink className="size-3 text-muted-foreground" />
                  </Link>
                  <Link
                    href="/admin/website-content/collections/projects"
                    className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/40 hover:bg-muted transition-colors font-medium"
                  >
                    <span>Projects Collection ({content.projects?.items?.length || 0})</span>
                    <ExternalLink className="size-3 text-muted-foreground" />
                  </Link>
                  <Link
                    href="/admin/website-content/collections/services"
                    className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/40 hover:bg-muted transition-colors font-medium"
                  >
                    <span>Services Collection ({content.services?.items?.length || 0})</span>
                    <ExternalLink className="size-3 text-muted-foreground" />
                  </Link>
                  <Link
                    href="/admin/website-content/collections/templates"
                    className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/40 hover:bg-muted transition-colors font-medium"
                  >
                    <span>Templates Collection ({content.templates?.items?.length || 0})</span>
                    <ExternalLink className="size-3 text-muted-foreground" />
                  </Link>
                </div>
              </Card>
            </div>

            {/* Page Metadata & Schema Form */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg font-bold">{activePageMeta.pageName}</CardTitle>
                    <Badge variant="outline" className="font-mono text-xs text-primary">
                      {selectedPath}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs mt-1">
                    Manage meta tags, social preview cards, and Schema.org JSON-LD for this route.
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2">
                  {selectedPath !== '/' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs"
                      onClick={() => handleDeletePage(selectedPath)}
                    >
                      <Trash2 className="size-3.5 mr-1" /> Remove
                    </Button>
                  )}
                </div>
              </CardHeader>

              {/* Subtabs for Active Page: Meta vs Schema */}
              <div className="px-6 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPageSubTab('meta')}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
                      pageSubTab === 'meta'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Globe className="size-3.5" />
                    <span>Search & Social Tags</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPageSubTab('schema')}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
                      pageSubTab === 'schema'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Code2 className="size-3.5" />
                    <span>Structured Data (JSON-LD)</span>
                    <Badge variant="secondary" className="text-[9px] px-1 py-0 font-mono">
                      Schema.org
                    </Badge>
                  </button>
                </div>
              </div>

              <CardContent className="space-y-4 pt-4">
                {pageSubTab === 'meta' ? (
                  <>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label>Page Title</Label>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {activePageMeta.title?.length || 0} / 60 chars
                        </span>
                      </div>
                      <Input
                        value={activePageMeta.title || ''}
                        onChange={(e) => updateSelectedPage({ title: e.target.value })}
                        placeholder="Page Title — Site Name"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label>Meta Description</Label>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {activePageMeta.description?.length || 0} / 160 chars
                        </span>
                      </div>
                      <Textarea
                        rows={3}
                        value={activePageMeta.description || ''}
                        onChange={(e) => updateSelectedPage({ description: e.target.value })}
                        placeholder="Concise overview summarizing this page content..."
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label>Target Keywords (Comma-separated)</Label>
                        <Input
                          value={activePageMeta.keywords || ''}
                          onChange={(e) => updateSelectedPage({ keywords: e.target.value })}
                          placeholder="keyword1, keyword2, keyword3"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label>Canonical URL</Label>
                        <Input
                          value={activePageMeta.canonicalUrl || ''}
                          onChange={(e) => updateSelectedPage({ canonicalUrl: e.target.value })}
                          placeholder="https://victormaina.mjinidigital.co.ke//..."
                        />
                      </div>
                    </div>

                    {/* Page Specific OG Image */}
                    <div className="space-y-1.5 pt-2">
                      <ImageUploader
                        value={activePageMeta.ogImage || content.seo.ogImage}
                        onChange={(url) => updateSelectedPage({ ogImage: url })}
                        label="Custom Social Sharing Card (Convex Storage)"
                        aspectRatio="wide"
                        placeholder="Upload page-specific social banner"
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-muted/40 border border-border p-4 mt-2">
                      <div>
                        <p className="text-xs font-semibold">Block Search Indexing (noindex)</p>
                        <p className="text-[11px] text-muted-foreground">
                          Tells Google, Bing, and sitemap.xml to exclude this specific URL from search crawlers.
                        </p>
                      </div>
                      <Switch
                        checked={Boolean(activePageMeta.noIndex)}
                        onCheckedChange={(checked) => updateSelectedPage({ noIndex: checked })}
                      />
                    </div>
                  </>
                ) : (
                  /* Page-level Schema.org Structured Data Tab */
                  <div className="space-y-5">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold">Schema.org Entity Type</Label>
                        <span className="text-[10px] text-muted-foreground font-mono">Google Rich Snippet Target</span>
                      </div>
                      <select
                        value={activePageMeta.structuredDataType || 'default'}
                        onChange={(e) => updateSelectedPage({ structuredDataType: e.target.value as PageStructuredDataType })}
                        className="w-full text-xs h-9 rounded-xl border border-input bg-background px-3 py-1 font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="default">Default Auto (Inferred from page route)</option>
                        <option value="WebSite">WebSite (Search box & main site identity)</option>
                        <option value="Product">Product (Packages, products, pricing & offers)</option>
                        <option value="Service">Service (Internet solutions, IT services, consulting)</option>
                        <option value="LocalBusiness">LocalBusiness (Physical office location & service areas)</option>
                        <option value="Organization">Organization (Company profile & branding)</option>
                        <option value="Article">Article (Articles, blog posts, news)</option>
                        <option value="SoftwareApplication">SoftwareApplication (Web application / software tool)</option>
                        <option value="WebPage">WebPage (Standard informational webpage)</option>
                        <option value="ProfilePage">ProfilePage (Bio & profile overview)</option>
                        <option value="AboutPage">AboutPage (About us & company history)</option>
                        <option value="ContactPage">ContactPage (Direct inquiry & contact point)</option>
                        <option value="CollectionPage">CollectionPage (Listings of packages, posts, services)</option>
                        <option value="FAQPage">FAQPage (Frequently asked questions accordion)</option>
                        <option value="Custom">Custom JSON-LD (Full manual override)</option>
                      </select>
                      <p className="text-[11px] text-muted-foreground">
                        Automatically generated with author, organization, and breadcrumb schemas according to Google guidelines.
                      </p>
                    </div>

                    {/* Custom JSON-LD Editor */}
                    <div className="space-y-2 pt-2 border-t border-border/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Label className="text-xs font-semibold">Custom Schema Override (JSON-LD)</Label>
                          {pageSchemaValidation.valid ? (
                            <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30 gap-1 py-0">
                              <CheckCircle2 className="size-2.5" /> Valid
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-[10px] gap-1 py-0">
                              <AlertTriangle className="size-2.5" /> Syntax Error
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handlePreloadPageTemplate}
                            className="text-[10px] h-6 px-2 text-primary hover:bg-primary/10"
                            title="Pre-fill editor with standard schema template"
                          >
                            <Sparkles className="size-3 mr-1" /> Load Template
                          </Button>
                          {activePageMeta.structuredDataCustomJson && (
                            <>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleFormatPageJson}
                                className="text-[10px] h-6 px-2 hover:bg-muted"
                              >
                                Format
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => updateSelectedPage({ structuredDataCustomJson: '' })}
                                className="text-[10px] h-6 px-2 text-muted-foreground hover:text-destructive"
                              >
                                <RotateCcw className="size-3 mr-1" /> Reset to Auto
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      <Textarea
                        rows={8}
                        value={activePageMeta.structuredDataCustomJson || ''}
                        onChange={(e) => updateSelectedPage({ structuredDataCustomJson: e.target.value })}
                        placeholder={`Optional: Custom Schema.org JSON-LD object for ${selectedPath}...\nClick "Load Template" to pre-fill with ${activePageMeta.structuredDataType || 'WebPage'} schema.`}
                        className="font-mono text-[11px] leading-relaxed resize-y bg-background/70 focus:bg-background"
                      />

                      {!pageSchemaValidation.valid && (
                        <p className="text-[11px] text-destructive flex items-center gap-1">
                          <AlertTriangle className="size-3 shrink-0" />
                          <span>{pageSchemaValidation.error}</span>
                        </p>
                      )}
                    </div>

                    {/* Live Schema Output Card */}
                    <div className="rounded-xl border border-border/70 bg-muted/20 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Code2 className="size-3.5 text-primary" />
                          <span className="text-xs font-semibold">Live JSON-LD Rendered for {selectedPath}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleCopyPageSchema}
                          className="h-6 text-[10px] gap-1 text-muted-foreground hover:text-foreground"
                        >
                          {copiedSchema ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                          <span>{copiedSchema ? 'Copied' : 'Copy JSON'}</span>
                        </Button>
                      </div>
                      <pre className="p-2.5 rounded-lg bg-background font-mono text-[10px] text-foreground/90 overflow-x-auto max-h-48 leading-relaxed border border-border/50">
                        {activePageSchemaString}
                      </pre>
                      <div className="flex items-center justify-end pt-1">
                        <a
                          href="https://search.google.com/test/rich-results"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                        >
                          <ShieldCheck className="size-3" /> Test in Google Rich Results Test <ExternalLink className="size-2.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 2. NEW Sitemap & Crawl Tab */}
        <TabsContent value="sitemap" className="mt-6 space-y-6">
          {/* Sitemap Header Metrics */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Card className="p-4 border-border/80 bg-card/60 space-y-1">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Total in Sitemap</span>
              <p className="text-2xl font-bold tracking-tight text-foreground">{indexedCount}</p>
              <p className="text-[10px] text-emerald-500 font-medium">Indexable URLs</p>
            </Card>

            <Card className="p-4 border-border/80 bg-card/60 space-y-1">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Core Pages</span>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {allSitemapItems.filter((i) => i.type === 'Core Page' && i.isIndexed).length}
              </p>
              <p className="text-[10px] text-muted-foreground">Primary navigation</p>
            </Card>

            <Card className="p-4 border-border/80 bg-card/60 space-y-1">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Dynamic Articles</span>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {allSitemapItems.filter((i) => i.type === 'Blog Post' && i.isIndexed).length}
              </p>
              <p className="text-[10px] text-muted-foreground">Published blog posts</p>
            </Card>

            <Card className="p-4 border-border/80 bg-card/60 space-y-1">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Projects & Work</span>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {allSitemapItems.filter((i) => (i.type === 'Project' || i.type === 'Service' || i.type === 'Template') && i.isIndexed).length}
              </p>
              <p className="text-[10px] text-muted-foreground">Portfolios & services</p>
            </Card>

            <Card className="p-4 border-border/80 bg-card/60 space-y-1">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Excluded / Draft</span>
              <p className="text-2xl font-bold tracking-tight text-amber-500">{excludedCount}</p>
              <p className="text-[10px] text-muted-foreground">noindex or draft</p>
            </Card>
          </div>

          {/* Sitemap Control & Quick Links Banner */}
          <Card className="border-border/80 bg-gradient-to-r from-primary/10 via-card to-card p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileCode2 className="size-4 text-primary" />
                  <h4 className="text-sm font-bold">Standard XML Sitemap (0.9 Protocol)</h4>
                  <Badge variant="outline" className="text-[10px] font-mono text-emerald-500 border-emerald-500/30">
                    Live Next.js Route
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
                  Generated on-the-fly from your Convex real-time database. Search engines like Google, Bing, and Copilot crawl this XML document to discover all your public pages and fresh content immediately.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-primary text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
                >
                  <FileCode2 className="size-3.5" />
                  <span>Open Live sitemap.xml</span>
                  <ExternalLink className="size-3" />
                </a>
                <a
                  href="/robots.txt"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground transition-colors"
                >
                  <Bot className="size-3.5" />
                  <span>Open robots.txt</span>
                  <ExternalLink className="size-3" />
                </a>
              </div>
            </div>
          </Card>

          {/* Sitemap Filter & Table */}
          <Card>
            <CardHeader className="p-4 pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-bold">All Registered Sitemap URLs ({filteredSitemapItems.length})</CardTitle>
                  <CardDescription className="text-xs">
                    Inspect every URL published to search engine crawlers with priority weights and change frequency.
                  </CardDescription>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap gap-1 bg-muted/60 p-1 rounded-xl">
                  {(['all', 'pages', 'blog', 'projects', 'services', 'templates', 'excluded'] as const).map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setSitemapFilter(filter)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg font-medium capitalize transition-colors ${
                        sitemapFilter === filter
                          ? 'bg-background text-foreground shadow-sm font-semibold'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 border-y border-border text-[11px] text-muted-foreground font-mono uppercase">
                  <tr>
                    <th className="px-4 py-2.5">Route URL</th>
                    <th className="px-4 py-2.5">Page Name</th>
                    <th className="px-4 py-2.5">Type</th>
                    <th className="px-4 py-2.5">Priority</th>
                    <th className="px-4 py-2.5">Change Frequency</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-sans">
                  {filteredSitemapItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-mono text-[11px] text-foreground font-medium truncate max-w-[240px]">
                        {item.path}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground truncate max-w-[200px]">
                        {item.name}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {item.type}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-mono text-muted-foreground">
                        {item.priority.toFixed(1)}
                      </td>
                      <td className="px-4 py-3 font-mono text-muted-foreground capitalize">
                        {item.changeFrequency}
                      </td>
                      <td className="px-4 py-3">
                        {item.isIndexed ? (
                          <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30 gap-1 py-0.5">
                            <CheckCircle2 className="size-2.5" /> Included
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-[10px] gap-1 py-0.5" title={item.reason}>
                            <AlertCircle className="size-2.5" /> Excluded
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <a
                          href={item.path}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                        >
                          Visit <ExternalLink className="size-2.5" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. Global Defaults Tab */}
        <TabsContent value="global" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Global Site SEO Defaults</CardTitle>
              <CardDescription>Default fallback metadata applied when a page does not specify overrides.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Default Fallback Title</Label>
                <Input
                  value={content.seo.title}
                  onChange={(e) => setContent({ ...content, seo: { ...content.seo, title: e.target.value } })}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Default Meta Description</Label>
                <Textarea
                  rows={3}
                  value={content.seo.description}
                  onChange={(e) => setContent({ ...content, seo: { ...content.seo, description: e.target.value } })}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Global Keywords</Label>
                  <Input
                    value={content.seo.keywords}
                    onChange={(e) => setContent({ ...content, seo: { ...content.seo, keywords: e.target.value } })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Base Canonical Domain</Label>
                  <Input
                    value={content.seo.canonicalUrl}
                    onChange={(e) => setContent({ ...content, seo: { ...content.seo, canonicalUrl: e.target.value } })}
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <ImageUploader
                  value={content.seo.ogImage}
                  onChange={(url) => setContent({ ...content, seo: { ...content.seo, ogImage: url } })}
                  label="Default Social Sharing (OG) Image (Convex Storage)"
                  aspectRatio="wide"
                  placeholder="Upload global social card image"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl bg-muted/40 border border-border p-4 mt-2">
                <div>
                  <p className="text-xs font-semibold">Global Search Engine Indexing (Robots.txt & Sitemap)</p>
                  <p className="text-[11px] text-muted-foreground">Allows all crawlers to index the website and enables sitemap generation.</p>
                </div>
                <Switch
                  checked={content.seo.allowIndexing}
                  onCheckedChange={(checked) => setContent({ ...content, seo: { ...content.seo, allowIndexing: checked } })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. External Search & Analytics APIs Tab */}
        <TabsContent value="apis" className="mt-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Google Search Console */}
            <Card className="border-border/80 bg-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-red-500/10 text-red-500 font-bold">
                      G
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold">Google Search Console</CardTitle>
                      <CardDescription className="text-xs">Site Ownership Verification</CardDescription>
                    </div>
                  </div>
                  <a
                    href="https://search.google.com/search-console"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                  >
                    Open GSC <ExternalLink className="size-3" />
                  </a>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                <div className="space-y-1.5">
                  <Label>Google Site Verification Meta Tag / Key</Label>
                  <Input
                    value={apisSettings.googleSiteVerification || ''}
                    onChange={(e) => updateApis({ googleSiteVerification: e.target.value })}
                    placeholder="e.g. google-site-verification=xxxxxx"
                    className="font-mono text-xs"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Injected into HTML <code className="text-primary font-mono">&lt;meta name=&quot;google-site-verification&quot;&gt;</code>.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Google Analytics 4 */}
            <Card className="border-border/80 bg-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 font-bold">
                      GA
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold">Google Analytics 4 (GA4)</CardTitle>
                      <CardDescription className="text-xs">Traffic & Event Tracking</CardDescription>
                    </div>
                  </div>
                  <a
                    href="https://analytics.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                  >
                    Open GA <ExternalLink className="size-3" />
                  </a>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                <div className="space-y-1.5">
                  <Label>GA4 Measurement ID</Label>
                  <Input
                    value={apisSettings.googleAnalyticsId || ''}
                    onChange={(e) => updateApis({ googleAnalyticsId: e.target.value })}
                    placeholder="G-XXXXXXXXXX"
                    className="font-mono text-xs"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Connects your site to Google Analytics reporting.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Google Tag Manager */}
            <Card className="border-border/80 bg-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 font-bold">
                      GTM
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold">Google Tag Manager</CardTitle>
                      <CardDescription className="text-xs">Centralized Tag Automation</CardDescription>
                    </div>
                  </div>
                  <a
                    href="https://tagmanager.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                  >
                    Open GTM <ExternalLink className="size-3" />
                  </a>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                <div className="space-y-1.5">
                  <Label>GTM Container ID</Label>
                  <Input
                    value={apisSettings.googleTagManagerId || ''}
                    onChange={(e) => updateApis({ googleTagManagerId: e.target.value })}
                    placeholder="GTM-XXXXXXX"
                    className="font-mono text-xs"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Allows loading marketing scripts and pixel events without code changes.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Bing Webmaster Tools */}
            <Card className="border-border/80 bg-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-teal-500/10 text-teal-500 font-bold">
                      B
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold">Bing Webmaster Tools</CardTitle>
                      <CardDescription className="text-xs">Microsoft Bing & Copilot Indexing</CardDescription>
                    </div>
                  </div>
                  <a
                    href="https://www.bing.com/webmasters"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                  >
                    Open Bing <ExternalLink className="size-3" />
                  </a>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                <div className="space-y-1.5">
                  <Label>Bing Verification Code (msvalidate.01)</Label>
                  <Input
                    value={apisSettings.bingVerification || ''}
                    onChange={(e) => updateApis({ bingVerification: e.target.value })}
                    placeholder="e.g. 74E7..."
                    className="font-mono text-xs"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Verifies ownership with Microsoft Bing & Yahoo search indexers.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Custom Verification & Head Scripts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold">Custom Header Verification Scripts</CardTitle>
              <CardDescription>
                Add custom verification tags, Pinterest domain verification, or custom analytics scripts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                rows={4}
                value={apisSettings.customHeadScript || ''}
                onChange={(e) => updateApis({ customHeadScript: e.target.value })}
                placeholder={'<meta name="p:domain_verify" content="..." />\n<!-- Custom SEO verification -->'}
                className="font-mono text-xs"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. Live Health & SERP Audit Tab */}
        <TabsContent value="audit" className="mt-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            {/* Google SERP Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="size-4 text-primary" />
                  Live Google SERP Snippet Preview: {activePageMeta.pageName}
                </CardTitle>
                <CardDescription className="text-xs">
                  Simulated appearance on Google desktop and mobile search results.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border border-border bg-background p-4 shadow-sm space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="size-5 rounded-full bg-primary/20 text-[10px] font-mono flex items-center justify-center text-primary font-bold">
                      V
                    </div>
                    <div className="text-xs text-muted-foreground truncate font-mono">
                      {activePageMeta.canonicalUrl || `${content.seo.canonicalUrl}${selectedPath}`}
                    </div>
                  </div>
                  <h4 className="text-base font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                    {activePageMeta.title || content.seo.title}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {activePageMeta.description || content.seo.description}
                  </p>
                </div>

                {/* Social Card Preview */}
                <div className="rounded-2xl border border-border bg-muted/20 p-4 space-y-2">
                  <p className="text-xs font-mono uppercase text-muted-foreground flex items-center gap-1.5">
                    <Share2 className="size-3.5" /> Social Media Card Preview (Twitter/LinkedIn/X)
                  </p>
                  <div className="overflow-hidden rounded-xl border border-border bg-card">
                    {(activePageMeta.ogImage || content.seo.ogImage) && (
                      <div className="aspect-[1.91/1] w-full overflow-hidden bg-muted">
                        <img
                          src={activePageMeta.ogImage || content.seo.ogImage}
                          alt="Social preview"
                          className="size-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-3">
                      <p className="text-[10px] font-mono uppercase text-muted-foreground truncate">
                        {content.seo.canonicalUrl.replace('https://', '')}
                      </p>
                      <p className="text-xs font-bold truncate mt-0.5">{activePageMeta.title}</p>
                      <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                        {activePageMeta.description}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Health Checklist & Quick Testing Links */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold">Page SEO Health Score</CardTitle>
                    <Badge variant={score >= 80 ? 'success' : score >= 50 ? 'accent' : 'destructive'}>
                      {score} / 100
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>Title Length ({titleLen} chars)</span>
                      <span className={titleLen >= 35 && titleLen <= 65 ? 'text-emerald-500' : 'text-amber-500'}>
                        {titleLen >= 35 && titleLen <= 65 ? 'Optimal (35-65)' : 'Needs attention'}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${titleLen >= 35 && titleLen <= 65 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                        style={{ width: `${Math.min(100, (titleLen / 65) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>Description Length ({descLen} chars)</span>
                      <span className={descLen >= 120 && descLen <= 165 ? 'text-emerald-500' : 'text-amber-500'}>
                        {descLen >= 120 && descLen <= 165 ? 'Optimal (120-165)' : 'Needs attention'}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${descLen >= 120 && descLen <= 165 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                        style={{ width: `${Math.min(100, (descLen / 165) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-emerald-500" />
                      <span>Mobile Responsive Viewport configured</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-emerald-500" />
                      <span>Schema.org JSON-LD structured data configured</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-emerald-500" />
                      <span>Dynamic XML Sitemap active & validated</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasGoogleVerification ? (
                        <CheckCircle2 className="size-4 text-emerald-500" />
                      ) : (
                        <AlertCircle className="size-4 text-amber-500" />
                      )}
                      <span>Google Search Console verification: {hasGoogleVerification ? 'Connected' : 'Missing'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* External Testing Tools */}
              <Card className="p-4 space-y-3">
                <p className="text-xs font-bold">External Verification & Speed Tools</p>
                <div className="space-y-2">
                  <a
                    href="https://search.google.com/test/rich-results"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground hover:bg-muted transition-colors"
                  >
                    <span>Google Rich Results Test</span>
                    <ExternalLink className="size-3.5 text-muted-foreground" />
                  </a>
                  <a
                    href="https://pagespeed.web.dev"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground hover:bg-muted transition-colors"
                  >
                    <span>Google PageSpeed Insights</span>
                    <ExternalLink className="size-3.5 text-muted-foreground" />
                  </a>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
