'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  FileCode2,
  ExternalLink,
  ChevronDown,
  Layers,
  Sparkles,
  LayoutTemplate,
  Briefcase,
  FileText,
  Wrench,
  Compass,
  HelpCircle,
  Globe,
  Menu,
  Share2,
  Save,
  Download,
  CheckCircle2,
  Loader2,
  Users
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export const contentNavigationGroups = [
  {
    group: 'Pages & Layouts',
    items: [
      { label: 'Page Builder', href: '/admin/website-content/pages', icon: LayoutTemplate, description: 'Visual block ordering and per-page layouts' },
    ]
  },
  {
    group: 'Collections',
    items: [
      { label: 'Projects', href: '/admin/website-content/collections/projects', icon: Briefcase, description: 'Portfolio case studies & work items' },
      { label: 'Services', href: '/admin/website-content/collections/services', icon: Layers, description: 'Service offerings, pricing & features' },
      { label: 'Careers & Jobs', href: '/admin/website-content/collections/careers', icon: Users, description: 'Job listings & applicant management' },
      { label: 'Blog Posts', href: '/admin/website-content/collections/blog', icon: FileText, description: 'Articles, markdown posts & guides' },
    ]
  },
  {
    group: 'Components',
    items: [
      { label: 'Hero Section', href: '/admin/website-content/components/hero', icon: Sparkles, description: 'Main headline, bio, avatar & CTAs' },
      { label: 'Tech Stack', href: '/admin/website-content/components/tech-stack', icon: Wrench, description: 'Technologies, tools & skills' },
      { label: 'Process Steps', href: '/admin/website-content/components/process', icon: Compass, description: 'Workflow steps & methodologies' },
      { label: 'FAQ', href: '/admin/website-content/components/faq', icon: HelpCircle, description: 'Frequently asked questions' },
      { label: 'Logos & Clients', href: '/admin/website-content/components/logos', icon: Globe, description: 'Partner and client brand logos' },
    ]
  },
  {
    group: 'Globals',
    items: [
      { label: 'Navigation Menu', href: '/admin/website-content/globals/navigation', icon: Menu, description: 'Header navigation links & branding' },
      { label: 'Footer', href: '/admin/website-content/globals/footer', icon: FileCode2, description: 'Footer links & copyright notice' },
      { label: 'Social Links', href: '/admin/website-content/globals/socials', icon: Share2, description: 'Social media handles and links' },
      { label: 'Backup & Export', href: '/admin/website-content/globals/backup', icon: Download, description: 'JSON backup, import & factory reset' },
    ]
  }
]

interface ContentHeaderProps {
  title: string
  description?: string
  badge?: string
  saving?: boolean
  lastSaved?: Date | null
  liveRoute?: string
  onSave?: () => void
  children?: React.ReactNode
}

export function ContentHeader({
  title,
  description,
  badge,
  saving = false,
  lastSaved = null,
  liveRoute = '/',
  onSave,
  children
}: ContentHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()

  const currentItem = contentNavigationGroups
    .flatMap((g) => g.items)
    .find((item) => item.href === pathname)

  return (
    <div className="mb-8 space-y-4">
      {/* Top Bar with Breadcrumbs + Dropdown Quick Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/admin/website-content" className="hover:text-foreground transition-colors font-medium">
            Website Content
          </Link>
          <span>/</span>
          {currentItem ? (
            <span className="text-foreground font-semibold">{currentItem.label}</span>
          ) : (
            <span className="text-foreground font-semibold">{title}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Dropdown Jump */}
          <div className="relative">
            <select
              value={pathname}
              onChange={(e) => router.push(e.target.value)}
              className="h-8 rounded-lg border border-border bg-background/80 px-2.5 py-1 text-xs font-medium text-foreground shadow-xs transition-colors hover:bg-muted focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer appearance-none pr-7"
              aria-label="Quick jump to section"
            >
              <option value="/admin/website-content">CMS Overview Hub</option>
              {contentNavigationGroups.map((group) => (
                <optgroup key={group.group} label={group.group}>
                  {group.items.map((item) => (
                    <option key={item.href} value={item.href}>
                      {item.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-2.5 size-3.5 text-muted-foreground" />
          </div>

          {/* Live Preview Button */}
          {liveRoute && (
            <Link
              href={liveRoute}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card/60 px-3 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <span>Preview</span>
              <ExternalLink className="size-3" />
            </Link>
          )}

          {/* Save Status Indicator */}
          {saving ? (
            <Badge variant="outline" className="h-8 gap-1.5 border-amber-500/30 bg-amber-500/10 text-amber-500 text-xs px-2.5">
              <Loader2 className="size-3 animate-spin" />
              <span>Saving...</span>
            </Badge>
          ) : lastSaved ? (
            <Badge variant="outline" className="h-8 gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-xs px-2.5">
              <CheckCircle2 className="size-3" />
              <span>Saved</span>
            </Badge>
          ) : null}

          {onSave && (
            <Button size="sm" onClick={onSave} disabled={saving} className="h-8 gap-1.5 rounded-lg text-xs font-semibold shadow-xs">
              <Save className="size-3.5" />
              <span>Save Changes</span>
            </Button>
          )}
        </div>
      </div>

      {/* Title & Description Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">{title}</h1>
            {badge && (
              <Badge variant="secondary" className="font-mono text-xs uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                {badge}
              </Badge>
            )}
          </div>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground max-w-3xl">{description}</p>
          )}
        </div>
        {children && <div className="flex items-center gap-2">{children}</div>}
      </div>
    </div>
  )
}
