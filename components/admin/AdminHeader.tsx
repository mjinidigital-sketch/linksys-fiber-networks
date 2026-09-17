'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { authClient } from '@/lib/auth-client'
import {
  Menu,
  Moon,
  Sun,
  Globe2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  LogOut,
  Users,
  Bell,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface AdminHeaderProps {
  onToggleMobile: () => void
}

export function AdminHeader({ onToggleMobile }: AdminHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const session = authClient.useSession()
  const [dark, setDark] = useState(true)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  const userProfile = useQuery(
    api.users.getCurrentUserWithProfile,
    session.data?.user ? {} : 'skip'
  )

  // Live admin unread count and open conversations from Convex
  const adminUnreadCount = useQuery(
    api.chat.adminGetTotalUnreadCount,
    userProfile?.role === 'admin' ? {} : 'skip'
  )

  const conversations = useQuery(
    api.chat.adminListConversations,
    userProfile?.role === 'admin' ? { status: 'open' } : 'skip'
  )

  // Filter conversations that have unread messages or are recent
  const unreadConversations = (conversations || []).filter(
    (c) => (c.unreadByAdmin || 0) > 0
  )
  const recentConversations = (conversations || []).slice(0, 4)

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false)
      }
    }
    if (notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [notificationsOpen])

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark')
    setDark(isDark)
  }, [])

  const switchTheme = () => {
    const nextDark = !dark
    setDark(nextDark)
    document.documentElement.classList.toggle('dark', nextDark)
  }

  const displayName = userProfile?.profile?.name || userProfile?.user?.name || 'Administrator'
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

  const profilePic = userProfile?.profile?.profilePic || userProfile?.user?.image

  return (
    <header className="sticky top-0 z-30 flex h-20 shrink-0 items-center justify-between border-b border-border bg-background/80 px-5 backdrop-blur-md sm:px-8 lg:px-10">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobile}
          className="rounded-xl border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="size-5" />
        </button>

        <div>
          <div className="mt-4 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-secondary">
            <span>Admin</span>
            <ChevronRight className="size-3 text-muted-foreground" />
            <span className="text-foreground">{pathname.replace('/admin', '').replace('/', '') || 'overview'}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Public Site Link */}
        <Link
          href="/"
          target="_blank"
          className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors shadow-xs"
        >
          <Globe2 className="size-3.5 text-primary" />
          <span>View Site</span>
          <ExternalLink className="size-3 text-muted-foreground" />
        </Link>

        {/* Live Chat Notification Bell Popover */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className={cn(
              'relative rounded-xl border border-border bg-card p-2.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-all shadow-xs cursor-pointer',
              notificationsOpen && 'border-primary/50 text-foreground bg-primary/10'
            )}
            title="Chat Notifications"
            aria-label="Chat notifications"
          >
            <Bell className="size-4" />
            {(adminUnreadCount || 0) > 0 && (
              <>
                <span className="absolute -top-1 -right-1 flex size-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                  <span className="relative inline-flex rounded-full size-3 bg-destructive" />
                </span>
                <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">
                  {adminUnreadCount}
                </span>
              </>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl border border-border bg-card/95 p-4 shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-150 z-50">
              <div className="flex items-center justify-between border-b border-border/80 pb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="size-4 text-primary" />
                  <h4 className="text-xs font-bold tracking-tight">Chat Notifications</h4>
                </div>
                {(adminUnreadCount || 0) > 0 ? (
                  <Badge variant="destructive" className="text-[9px] py-0 px-1.5 font-bold animate-pulse">
                    {adminUnreadCount} Unread
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[9px] py-0 px-1.5 text-emerald-500 border-emerald-500/30 bg-emerald-500/10">
                    All caught up
                  </Badge>
                )}
              </div>

              {/* Notification Items */}
              <div className="divide-y divide-border/60 max-h-72 overflow-y-auto custom-scrollbar my-2">
                {unreadConversations.length > 0 ? (
                  unreadConversations.map((conv) => (
                    <button
                      key={conv._id}
                      onClick={() => {
                        setNotificationsOpen(false)
                        router.push('/admin/chats')
                      }}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-muted/50 transition-colors flex items-start gap-2.5 group cursor-pointer"
                    >
                      <div className="relative size-8 shrink-0 overflow-hidden rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                        {(conv.userName || 'U').substring(0, 2).toUpperCase()}
                        <span className="absolute top-0 right-0 size-2 rounded-full bg-destructive ring-1 ring-card" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold truncate group-hover:text-primary transition-colors">
                            {conv.userName || 'Customer'}
                          </p>
                          <span className="text-[9px] font-mono text-muted-foreground">
                            {new Date(conv.lastMessageAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate leading-snug mt-0.5">
                          {conv.lastMessage || 'New message received'}
                        </p>
                      </div>
                    </button>
                  ))
                ) : recentConversations.length > 0 ? (
                  <div className="py-2">
                    <p className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70">
                      Recent Active Threads
                    </p>
                    {recentConversations.map((conv) => (
                      <button
                        key={conv._id}
                        onClick={() => {
                          setNotificationsOpen(false)
                          router.push('/admin/chats')
                        }}
                        className="w-full text-left p-2 rounded-xl hover:bg-muted/50 transition-colors flex items-center gap-2.5 group cursor-pointer"
                      >
                        <div className="size-7 shrink-0 rounded-lg bg-muted flex items-center justify-center text-[10px] font-bold text-foreground">
                          {(conv.userName || 'U').substring(0, 1).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium truncate group-hover:text-primary transition-colors">
                            {conv.userName || 'Customer'}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {conv.lastMessage || 'Open thread'}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center space-y-1.5">
                    <CheckCircle2 className="mx-auto size-7 text-emerald-500/70" />
                    <p className="text-xs font-medium text-foreground">No pending chat messages</p>
                    <p className="text-[10px] text-muted-foreground">
                      New messages from customers will appear here in real-time.
                    </p>
                  </div>
                )}
              </div>

              {/* View All Link */}
              <div className="border-t border-border/80 pt-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs gap-1.5 h-8 font-semibold shadow-xs"
                  onClick={() => {
                    setNotificationsOpen(false)
                    router.push('/admin/chats')
                  }}
                >
                  <span>Open Live Chat Dashboard</span>
                  <ArrowRight className="size-3.5 ml-auto" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Theme Switcher */}
        <button
          onClick={switchTheme}
          className="rounded-xl border border-border bg-card p-2.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shadow-xs cursor-pointer"
          aria-label="Toggle theme"
        >
          {dark ? <Sun className="size-4 text-amber-500" /> : <Moon className="size-4 text-indigo-500" />}
        </button>

        {/* User Profile */}
        <div className="hidden items-center gap-3 border-l border-border pl-4 sm:flex">
          <div className="relative flex size-9 items-center justify-center overflow-hidden rounded-full border border-border bg-primary font-mono text-xs font-bold text-primary-foreground shadow-sm shadow-primary/30">
            {profilePic ? (
              <img src={profilePic} alt={displayName} className="size-full object-cover" />
            ) : (
              initials || 'AD'
            )}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1">
              <p className="text-sm font-semibold leading-none">{displayName}</p>
              <ShieldCheck className="size-3 text-emerald-500" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground leading-none capitalize">
              {userProfile?.role === 'editor' ? 'Editor (Staff)' : userProfile?.role || 'Admin'}
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              await authClient.signOut()
              router.push('/auth/login')
            }}
            title="Sign out"
            className="ml-2 h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}

