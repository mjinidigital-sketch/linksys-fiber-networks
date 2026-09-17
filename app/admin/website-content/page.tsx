'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  Layers,
  Briefcase,
  Wrench,
  Compass,
  FileText,
  Mail,
  Menu,
  FileCode2,
  ExternalLink,
  Globe,
  Upload,
  Download,
  Copy,
  LayoutTemplate,
  Search,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Database,
  HelpCircle,
  Share2,
  FolderOpen,
  Users
} from 'lucide-react'
import { useWebsiteContent } from '@/hooks/use-website-content'
import { useToast } from '@/components/ui/toast'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ContentHeader } from '@/components/admin/ContentHeader'
import { defaultPageLayouts } from '@/lib/default-content'

export default function WebsiteContentHubPage() {
  const { content, loading, saving, lastSaved } = useWebsiteContent()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')

  const activePageLayouts = content.pageLayouts || defaultPageLayouts
  const pageCount = Object.keys(activePageLayouts).length
  const projectCount = content.projects?.items?.length || 0
  const serviceCount = content.services?.items?.length || 0
  const blogCount = content.blog?.posts?.length || 0
  const techCount = content.techStack?.items?.length || 0

  const hubSections = [
    {
      category: 'Pages & Layouts',
      description: 'Configure page routes, block order, and block content overrides per page',
      items: [
        {
          title: 'Page Builder & Routes',
          description: `Manage ${pageCount} pages, visual block ordering, hero/features/FAQ blocks per route`,
          href: '/admin/website-content/pages',
          icon: LayoutTemplate,
          badge: `${pageCount} Pages`,
          color: 'from-blue-500/20 to-indigo-500/20 text-blue-500',
        },
      ]
    },
    {
      category: 'Content Collections',
      description: 'Manage primary structured collections, projects, articles and products',
      items: [
        {
          title: 'Projects',
          description: `Case studies, work portfolio items, tags and rich markdown presentations`,
          href: '/admin/website-content/collections/projects',
          icon: Briefcase,
          badge: `${projectCount} Items`,
          color: 'from-amber-500/20 to-orange-500/20 text-amber-500',
        },
        {
          title: 'Services',
          description: `Engineering & design service tiers, pricing, features lists and icons`,
          href: '/admin/website-content/collections/services',
          icon: Layers,
          badge: `${serviceCount} Services`,
          color: 'from-emerald-500/20 to-teal-500/20 text-emerald-500',
        },
        {
          title: 'Careers & Jobs',
          description: `Manage job listings, open positions, requirements, and incoming applicant applications`,
          href: '/admin/website-content/collections/careers',
          icon: Users,
          badge: 'Job Board',
          color: 'from-violet-500/20 to-purple-500/20 text-violet-500',
        },
        {
          title: 'Blog Posts',
          description: `Technical articles, guides, markdown editor, categories and publication states`,
          href: '/admin/website-content/collections/blog',
          icon: FileText,
          badge: `${blogCount} Posts`,
          color: 'from-rose-500/20 to-pink-500/20 text-rose-500',
        },
      ]
    },

    {
      category: 'Reusable Components',
      description: 'Customize section components displayed across home and landing pages',
      items: [
        {
          title: 'Hero Section',
          description: 'Headline text, glowing highlights, bio, avatar, CTA buttons and status card',
          href: '/admin/website-content/components/hero',
          icon: Sparkles,
          badge: 'High Impact',
          color: 'from-primary/20 to-primary/10 text-primary',
        },
        {
          title: 'Tech Stack & Skills',
          description: `Manage ${techCount} technologies, skills badges, and categorized tools`,
          href: '/admin/website-content/components/tech-stack',
          icon: Wrench,
          badge: `${techCount} Skills`,
          color: 'from-cyan-500/20 to-blue-500/20 text-cyan-500',
        },
        {
          title: 'Process Steps',
          description: 'Methodology timeline, step numbers, titles and workflow descriptions',
          href: '/admin/website-content/components/process',
          icon: Compass,
          badge: `${content.process?.steps?.length || 0} Steps`,
          color: 'from-lime-500/20 to-emerald-500/20 text-lime-500',
        },
        {
          title: 'FAQ Section',
          description: 'Common questions and answers for prospective clients and visitors',
          href: '/admin/website-content/components/faq',
          icon: HelpCircle,
          badge: `${content.faq?.items?.length || 0} FAQs`,
          color: 'from-orange-500/20 to-yellow-500/20 text-orange-500',
        },
        {
          title: 'Logos & Clients',
          description: 'Brand names, partner tools, and trusted client badges',
          href: '/admin/website-content/components/logos',
          icon: Globe,
          badge: `${content.logos?.items?.length || 0} Logos`,
          color: 'from-purple-500/20 to-pink-500/20 text-purple-500',
        },
      ]
    },
    {
      category: 'Global Elements',
      description: 'Manage sitewide navigation, footer, social profiles and database backup',
      items: [
        {
          title: 'Navigation Menu',
          description: 'Header navigation items, brand accent and header action links',
          href: '/admin/website-content/globals/navigation',
          icon: Menu,
          badge: `${content.navigation?.links?.length || 0} Links`,
          color: 'from-indigo-500/20 to-blue-500/20 text-indigo-500',
        },
        {
          title: 'Footer',
          description: 'Copyright notice, bottom navigation links and legal text',
          href: '/admin/website-content/globals/footer',
          icon: FileCode2,
          badge: 'Sitewide',
          color: 'from-slate-500/20 to-gray-500/20 text-slate-400',
        },
        {
          title: 'Social Links',
          description: 'Social media profile handles, external links and display icons',
          href: '/admin/website-content/globals/socials',
          icon: Share2,
          badge: `${content.contact?.socials?.length || 0} Socials`,
          color: 'from-sky-500/20 to-cyan-500/20 text-sky-500',
        },
        {
          title: 'Backup & Sync',
          description: 'Export JSON schema backup, import custom configurations, or reset defaults',
          href: '/admin/website-content/globals/backup',
          icon: Download,
          badge: 'Database',
          color: 'from-rose-500/20 to-red-500/20 text-rose-500',
        },
      ]
    }
  ]

  const filteredSections = hubSections.map((sec) => ({
    ...sec,
    items: sec.items.filter(
      (item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sec.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter((sec) => sec.items.length > 0)

  return (
    <div className="space-y-8">
      <ContentHeader
        title="Website Content Editor"
        description="Manage pages, structured collections, reusable components, and global configurations in one organized system."
        badge="Modular CMS"
        saving={saving}
        lastSaved={lastSaved}
      />

      {/* Metrics Overview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-2xl border border-border/80 bg-card/60 p-4 backdrop-blur-xs">
          <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Pages</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{pageCount}</p>
        </div>
        <div className="rounded-2xl border border-border/80 bg-card/60 p-4 backdrop-blur-xs">
          <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Projects</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{projectCount}</p>
        </div>
        <div className="rounded-2xl border border-border/80 bg-card/60 p-4 backdrop-blur-xs">
          <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Services</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{serviceCount}</p>
        </div>
        <div className="rounded-2xl border border-border/80 bg-card/60 p-4 backdrop-blur-xs">
          <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Jobs</p>
          <p className="mt-1 text-2xl font-bold text-foreground">—</p>
        </div>
        <div className="rounded-2xl border border-border/80 bg-card/60 p-4 backdrop-blur-xs">
          <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Blog Posts</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{blogCount}</p>
        </div>
        <div className="rounded-2xl border border-border/80 bg-card/60 p-4 backdrop-blur-xs">
          <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Skills</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{techCount}</p>
        </div>
      </div>

      {/* Quick Search & Filter */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 size-4 text-muted-foreground" />
        <Input
          placeholder="Filter content pages, collections, components (e.g. 'hero', 'projects', 'footer')..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-10 rounded-xl bg-card/60 border-border/80 text-sm"
        />
      </div>

      {/* Categorized Content Grid */}
      <div className="space-y-8">
        {filteredSections.map((section) => (
          <div key={section.category} className="space-y-3">
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-bold tracking-tight text-foreground">{section.category}</h2>
              <span className="text-xs text-muted-foreground">{section.description}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {section.items.map((item) => {
                const Icon = item.icon
                return (
                  <Link key={item.href} href={item.href} className="group block">
                    <Card className="h-full border-border/80 bg-card/60 hover:bg-card hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/5">
                      <CardHeader className="p-5 pb-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className={`p-2.5 rounded-xl bg-linear-to-br ${item.color} border border-border/50`}>
                            <Icon className="size-5" />
                          </div>
                          {item.badge && (
                            <Badge variant="outline" className="text-[10px] font-mono px-2 py-0.5 border-border bg-background/50">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="mt-3 text-base font-bold text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                          <span>{item.title}</span>
                          <ArrowRight className="size-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-primary" />
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground line-clamp-2">
                          {item.description}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
