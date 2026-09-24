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
        <div className="rounded-2xl border border-primary/30 bg-background/95 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="font-bold text-base text-foreground tracking-tight">Admin Panel</p>
            <span className="flex size-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>

        {/* Main Navigation */}
        <div className="mt-5">
          <p className="px-3 font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Navigation
          </p>
          <nav className="mt-2 space-y-1.5" aria-label="Admin navigation">
            {/* Overview */}
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all group',
                pathname === '/admin'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-foreground/80 hover:bg-muted hover:text-foreground'
              )}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className={cn('size-4 shrink-0', pathname === '/admin' ? 'text-primary-foreground' : 'text-primary')} />
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
                    'flex flex-1 items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all group',
                    isContentActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-foreground/80 hover:bg-muted hover:text-foreground'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <FileCode2 className={cn('size-4 shrink-0', isContentActive ? 'text-primary-foreground' : 'text-primary')} />
                    <span>Website Content</span>
                  </div>
                  <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide', isContentActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-primary/10 text-primary')}>
                    Core
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={() => setContentDropdownOpen(!contentDropdownOpen)}
                  className="flex size-9 items-center justify-center rounded-xl text-foreground/70 hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                  title={contentDropdownOpen ? 'Collapse menu' : 'Expand menu'}
                  aria-label="Toggle website content menu"
                >
                  <ChevronDown
                    className={cn('size-4 transition-transform duration-200', contentDropdownOpen && 'rotate-180')}
                  />
                </button>
              </div>

              {/* Collapsible Sub-menu */}
              {contentDropdownOpen && (
                <div className="ml-3 border-l-2 border-border pl-3 space-y-3 py-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                  {websiteContentSections.map((category) => (
                    <div key={category.title} className="space-y-1">
                      <p className="px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
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
                              'flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors',
                              isSubActive
                                ? 'bg-primary/15 text-primary font-bold shadow-xs'
                                : 'text-foreground/80 hover:bg-muted hover:text-foreground'
                            )}
                          >
                            <Icon className={cn('size-4 shrink-0', isSubActive ? 'text-primary' : 'text-muted-foreground')} />
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
                'flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all group',
                pathname === '/admin/chats'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-foreground/80 hover:bg-muted hover:text-foreground'
              )}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className={cn('size-4 shrink-0', pathname === '/admin/chats' ? 'text-primary-foreground' : 'text-secondary')} />
                <span>Live Chat & Support</span>
              </div>
              {adminUnreadCount !== undefined && adminUnreadCount > 0 ? (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-bold text-destructive-foreground animate-pulse">
                  {adminUnreadCount}
                </span>
              ) : (
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">
                  Live
                </span>
              )}
            </Link>

            {/* Other Admin Routes */}
            <Link
              href="/admin/users"
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all group',
                pathname === '/admin/users'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-foreground/80 hover:bg-muted hover:text-foreground'
              )}
            >
              <div className="flex items-center gap-3">
                <Users className={cn('size-4 shrink-0', pathname === '/admin/users' ? 'text-primary-foreground' : 'text-secondary')} />
                <span>User Management</span>
              </div>
              <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700 dark:text-amber-300 border border-amber-500/30">
                Admin
              </span>
            </Link>

            <Link
              href="/admin/seo"
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all group',
                pathname === '/admin/seo'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-foreground/80 hover:bg-muted hover:text-foreground'
              )}
            >
              <div className="flex items-center gap-3">
                <Search className={cn('size-4 shrink-0', pathname === '/admin/seo' ? 'text-primary-foreground' : 'text-secondary')} />
                <span>SEO Settings</span>
              </div>
            </Link>

            <Link
              href="/admin/socials"
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all group',
                pathname === '/admin/socials'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-foreground/80 hover:bg-muted hover:text-foreground'
              )}
            >
              <div className="flex items-center gap-3">
                <Share2 className={cn('size-4 shrink-0', pathname === '/admin/socials' ? 'text-primary-foreground' : 'text-secondary')} />
                <span>Social Links</span>
              </div>
            </Link>

            <Link
              href="/admin/settings"
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all group',
                pathname === '/admin/settings'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-foreground/80 hover:bg-muted hover:text-foreground'
              )}
            >
              <div className="flex items-center gap-3">
                <Settings className={cn('size-4 shrink-0', pathname === '/admin/settings' ? 'text-primary-foreground' : 'text-secondary')} />
                <span>Site Settings</span>
              </div>
            </Link>
          </nav>
        </div>

        {/* Bottom Public Link */}
        <div className="border-t border-border pt-3.5 mt-5">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-foreground hover:bg-muted transition-colors shadow-xs"
          >
            <Globe2 className="size-4 text-primary shrink-0" />
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
