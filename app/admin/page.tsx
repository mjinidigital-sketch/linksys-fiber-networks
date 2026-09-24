'use client'

import Link from 'next/link'
import {
  Activity,
  BarChart3,
  Briefcase,
  FileText,
  Layers,
  Wrench,
  Globe2,
  ArrowRight,
  Sparkles,
  Search,
  Settings,
  Share2,
  CheckCircle2,
  ExternalLink,
  Plus
} from 'lucide-react'
import { useWebsiteContent } from '@/hooks/use-website-content'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function AdminOverviewPage() {
  const { content, loading } = useWebsiteContent()

  if (loading || !content) {
    return (
      <div className="mx-auto max-w-7xl space-y-8 animate-pulse">
        <div className="h-40 rounded-3xl bg-muted" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-muted" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="h-80 rounded-2xl bg-muted" />
          <div className="h-80 rounded-2xl bg-muted" />
        </div>
      </div>
    )
  }

  const stats = [
    {
      label: 'Projects Shipped',
      value: content.projects.items.length.toString(),
      subtext: `${content.projects.items.filter((p) => p.featured).length} featured on home`,
      icon: Briefcase,
      color: 'text-primary',
    },
    {
      label: 'Services Offered',
      value: content.services.items.length.toString(),
      subtext: 'Active service packages',
      icon: Layers,
      color: 'text-emerald-500',
    },
    {
      label: 'Articles Published',
      value: content.blog.posts.length.toString(),
      subtext: `${content.blog.posts.filter((p) => p.published).length} published live`,
      icon: FileText,
      color: 'text-blue-500',
    },
    {
      label: 'Technologies in Stack',
      value: content.techStack.items.length.toString(),
      subtext: `${content.logos.items.length} ecosystem tools`,
      icon: Wrench,
      color: 'text-amber-500',
    },
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/15 via-card to-card p-6 sm:p-8">
        <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="max-w-xl">
            <div className="flex items-center gap-2">
              <Badge variant="success">CMS Active & Synchronized</Badge>
              {content.lastUpdated && (
                <span className="text-[11px] font-mono text-muted-foreground">
                  Updated: {new Date(content.lastUpdated).toLocaleDateString()}
                </span>
              )}
            </div>
            <h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome back, {content.general.displayName}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your entire portfolio, update case studies, customize copy, and edit every component prop dynamically.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/admin/website-content">
              <Button className="rounded-xl shadow-lg shadow-primary/25 bg-primary font-semibold text-primary-foreground">
                <Sparkles className="size-4 mr-1.5" />
                Edit Website Content
              </Button>
            </Link>
            <Link href="/" target="_blank">
              <Button variant="outline" className="rounded-xl">
                <Globe2 className="size-4 mr-1.5" />
                View Public Site
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, subtext, icon: Icon, color }) => (
          <Card key={label} className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
              <div className="rounded-xl bg-muted p-2">
                <Icon className={`size-4 ${color}`} />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold tracking-tight">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{subtext}</p>
          </Card>
        ))}
      </div>

      {/* Main Section Grid */}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Quick Access to Content Editors */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Content Management Shortcuts</CardTitle>
              <CardDescription>Jump straight to specific sections of your portfolio</CardDescription>
            </div>
            <Link href="/admin/website-content" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
              View All <ArrowRight className="size-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <Link
              href="/admin/website-content"
              className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:bg-muted/30"
            >
              <div className="flex items-center gap-3.5">
                <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                  <Sparkles className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Hero & Headline Copy</h4>
                  <p className="text-xs text-muted-foreground">Modify introductory headlines, bio, and CTA buttons</p>
                </div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground" />
            </Link>

            <Link
              href="/admin/website-content"
              className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:bg-muted/30"
            >
              <div className="flex items-center gap-3.5">
                <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-500">
                  <Briefcase className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Projects & Case Studies ({content.projects.items.length})</h4>
                  <p className="text-xs text-muted-foreground">Add new projects, update tags, links, and screenshots</p>
                </div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground" />
            </Link>

            <Link
              href="/admin/website-content"
              className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:bg-muted/30"
            >
              <div className="flex items-center gap-3.5">
                <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-500">
                  <FileText className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Blog Posts & Insights ({content.blog.posts.length})</h4>
                  <p className="text-xs text-muted-foreground">Draft or publish technical writings and notes</p>
                </div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground" />
            </Link>

            <Link
              href="/admin/website-content"
              className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:bg-muted/30"
            >
              <div className="flex items-center gap-3.5">
                <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-500">
                  <Wrench className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Tech Stack & Ecosystem Tools</h4>
                  <p className="text-xs text-muted-foreground">Add or remove skills and partner logos</p>
                </div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>

        {/* Quick Profile & SEO Overview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile & SEO Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full overflow-hidden border-2 border-primary">
                  <img src={content.general.avatarUrl} alt="Avatar" className="size-full object-cover" />
                </div>
                <div>
                  <p className="text-sm font-bold">{content.general.displayName}</p>
                  <p className="text-xs text-muted-foreground">{content.general.role}</p>
                  <p className="text-xs text-emerald-500 font-medium mt-0.5">● {content.general.statusBadge}</p>
                </div>
              </div>

              <div className="border-t border-border pt-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Site Title:</span>
                  <span className="font-medium truncate max-w-[200px]">{content.seo.title}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Indexing:</span>
                  <Badge variant={content.seo.allowIndexing ? 'success' : 'secondary'} className="text-[10px]">
                    {content.seo.allowIndexing ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Social Links:</span>
                  <span className="font-mono">{content.contact.socials.length} connected</span>
                </div>
              </div>

              <div className="pt-2 grid grid-cols-3 gap-2">
                <Link href="/admin/seo" className="w-full">
                  <Button variant="outline" size="sm" className="w-full rounded-xl text-xs">
                    <Search className="size-3.5 mr-1" /> SEO
                  </Button>
                </Link>
                <Link href="/admin/socials" className="w-full">
                  <Button variant="outline" size="sm" className="w-full rounded-xl text-xs">
                    <Share2 className="size-3.5 mr-1" /> Socials
                  </Button>
                </Link>
                <Link href="/admin/settings" className="w-full">
                  <Button variant="outline" size="sm" className="w-full rounded-xl text-xs">
                    <Settings className="size-3.5 mr-1" /> Settings
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Quick Hub for Chats & Team */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Administration & Operations</CardTitle>
              <CardDescription>Direct shortcuts to team and live customer support</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <Link
                href="/admin/chats"
                className="flex items-center justify-between rounded-xl border border-border p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-2.5">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Sparkles className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Live Chat Support</p>
                    <p className="text-[11px] text-muted-foreground">Manage real-time customer conversations</p>
                  </div>
                </div>
                <ArrowRight className="size-4 text-muted-foreground" />
              </Link>

              <Link
                href="/admin/users"
                className="flex items-center justify-between rounded-xl border border-border p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-2.5">
                  <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-500">
                    <CheckCircle2 className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">User & Role Management</p>
                    <p className="text-[11px] text-muted-foreground">Manage administrators and staff permissions</p>
                  </div>
                </div>
                <ArrowRight className="size-4 text-muted-foreground" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

