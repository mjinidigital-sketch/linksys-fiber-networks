'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import {
  LayoutDashboard,
  FileCode2,
  Search,
  Share2,
  Settings,
  Globe2,
  Users,
  MessageSquare,
  ExternalLink,
  ChevronDown,
  LayoutTemplate,
  Briefcase,
  Layers,
  FileText,
  DollarSign,
  Sparkles,
  Wrench,
  Compass,
  HelpCircle,
  Globe,
  Menu,
  Download
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SubNavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

interface ContentCategory {
  title: string
  items: SubNavItem[]
}

const websiteContentSections: ContentCategory[] = [
  {
    title: 'Pages',
    items: [
      { label: 'Page Builder', href: '/admin/website-content/pages', icon: LayoutTemplate },
    ]
  },
  {
    title: 'Collections',
    items: [
      { label: 'Projects', href: '/admin/website-content/collections/projects', icon: Briefcase },
      { label: 'Services', href: '/admin/website-content/collections/services', icon: Layers },
      { label: 'Pricing Plans', href: '/admin/website-content/collections/pricing', icon: DollarSign },
      { label: 'Careers & Jobs', href: '/admin/website-content/collections/careers', icon: Users },
      { label: 'Blog Posts', href: '/admin/website-content/collections/blog', icon: FileText },
    ]
  },
  {
    title: 'Globals',
    items: [
      { label: 'Navigation', href: '/admin/website-content/globals/navigation', icon: Menu },
      { label: 'Footer', href: '/admin/website-content/globals/footer', icon: FileCode2 },
      { label: 'Socials', href: '/admin/website-content/globals/socials', icon: Share2 },
      { label: 'Backup & Sync', href: '/admin/website-content/globals/backup', icon: Download },
    ]
  }
]


interface AdminSidebarProps {
  mobileOpen: boolean
  setMobileOpen: (open: boolean) => void
}

export function AdminSidebar({ mobileOpen, setMobileOpen }: AdminSidebarProps) {
  const pathname = usePathname()
  const isContentActive = pathname.startsWith('/admin/website-content')
  const [contentDropdownOpen, setContentDropdownOpen] = useState(true)

  // Live admin unread messages count from Convex
  const adminUnreadCount = useQuery(api.chat.adminGetTotalUnreadCount)

  // Keep dropdown open if user navigates to content subpage
  useEffect(() => {
    if (isContentActive) {
      setContentDropdownOpen(true)
    }
  }, [isContentActive])

  return (
    <>
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex h-screen w-72 shrink-0 flex-col border-r border-border bg-card p-4 backdrop-blur-md transition-transform overflow-y-auto custom-scrollbar lg:static lg:h-screen lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="rounded-2xl border border-primary/20 bg-background/90 p-3.5">
          <div className="flex items-center justify-between">
            <p className="font-bold ">Admin Panel</p>
            <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>

        {/* Main Navigation */}
        <div className="mt-5">
          <p className="px-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
            Navigation
          </p>
          <nav className="mt-2 space-y-1" aria-label="Admin navigation">
            {/* Overview */}
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all group',
                pathname === '/admin'
                  ? 'bg-secondary text-primary-foreground shadow-xs shadow-primary/25'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className={cn('size-4 shrink-0', pathname === '/admin' ? 'text-accent' : 'text-secondary')} />
                <span>Overview</span>
              </div>
            </Link>

            {/* Website Content with Dropdown */}
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Link
                  href="/admin/website-content"
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex flex-1 items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all group',
                    isContentActive
                      ? 'bg-secondary text-muted font-semibold'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground '
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <FileCode2 className="size-4 shrink-0 text-primary" />
                    <span>Website Content</span>
                  </div>
                  <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-primary">
                    Core
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={() => setContentDropdownOpen(!contentDropdownOpen)}
                  className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                  title={contentDropdownOpen ? 'Collapse menu' : 'Expand menu'}
                  aria-label="Toggle website content menu"
                >
                  <ChevronDown
                    className={cn('size-3.5 transition-transform duration-200', contentDropdownOpen && 'rotate-180')}
                  />
                </button>
              </div>

              {/* Collapsible Sub-menu */}
              {contentDropdownOpen && (
                <div className="ml-2.5 border-l border-border/70 pl-2.5 space-y-3 py-1 animate-in fade-in slide-in-from-top-1 duration-200">
                  {websiteContentSections.map((category) => (
                    <div key={category.title} className="space-y-0.5">
                      <p className="px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                        {category.title}
                      </p>
                      {category.items.map(({ label, href, icon: Icon }) => {
                        const isSubActive = pathname === href
                        return (
                          <Link
                            key={href}
                            href={href}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                              'flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors',
                              isSubActive
                                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            )}
                          >
                            <Icon className={cn('size-3.5 shrink-0', isSubActive ? 'text-primary-foreground' : 'text-muted-foreground/80')} />
                            <span>{label}</span>
                          </Link>
                        )
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Live Chat & Support Route */}
            <Link
              href="/admin/chats"
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all group',
                pathname === '/admin/chats'
                  ? 'bg-primary text-primary-foreground shadow-xs shadow-primary/25'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className={cn('size-4 shrink-0', pathname === '/admin/chats' ? 'text-secondary' : 'text-secondary')} />
                <span>Live Chat & Support</span>
              </div>
              {adminUnreadCount !== undefined && adminUnreadCount > 0 ? (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground animate-pulse">
                  {adminUnreadCount}
                </span>
              ) : (
                <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-emerald-500">
                  Live
                </span>
              )}
            </Link>

            {/* Other Admin Routes */}
            <Link
              href="/admin/users"
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all group',
                pathname === '/admin/users'
                  ? 'bg-primary text-primary-foreground shadow-xs shadow-primary/25'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <div className="flex items-center gap-2.5">
                <Users className={cn('size-4 shrink-0', pathname === '/admin/users' ? 'text-secondary' : 'text-secondary')} />
                <span>User Management</span>
              </div>
              <span className="rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-amber-500 border border-amber-500/20">
                Admin Only
              </span>
            </Link>

            <Link
              href="/admin/seo"
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all group',
                pathname === '/admin/seo'
                  ? 'bg-primary text-primary-foreground shadow-xs shadow-primary/25'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <div className="flex items-center gap-2.5">
                <Search className={cn('size-4 shrink-0', pathname === '/admin/seo' ? 'text-secondary' : 'text-secondary')} />
                <span>SEO Settings</span>
              </div>
            </Link>

            <Link
              href="/admin/socials"
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all group',
                pathname === '/admin/socials'
                  ? 'bg-primary text-primary-foreground shadow-xs shadow-primary/25'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <div className="flex items-center gap-2.5">
                <Share2 className={cn('size-4 shrink-0', pathname === '/admin/socials' ? 'text-secondary' : 'text-secondary')} />
                <span>Social Links</span>
              </div>
            </Link>

            <Link
              href="/admin/settings"
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all group',
                pathname === '/admin/settings'
                  ? 'bg-primary text-primary-foreground shadow-xs shadow-primary/25'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <div className="flex items-center gap-2.5">
                <Settings className={cn('size-4 shrink-0', pathname === '/admin/settings' ? 'text-secondary' : 'text-secondary')} />
                <span>Site Settings</span>
              </div>
            </Link>
          </nav>
        </div>

        {/* Bottom Public Link */}
        <div className="border-t border-border pt-3 mt-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-xl border border-border bg-background/50 px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Globe2 className="size-4 text-primary" />
            <span>Open Public Site</span>
          </Link>
        </div>
      </aside>

      {mobileOpen && (
        <button
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation overlay"
        />
      )}
    </>
  )
}
