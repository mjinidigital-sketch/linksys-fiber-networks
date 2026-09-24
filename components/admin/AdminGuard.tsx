"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { api } from "@/convex/_generated/api"
import { useConvexAuth, useQuery, useMutation } from "convex/react"
import {
  Loader2,
  ShieldAlert,
  LogOut,
  ArrowLeft,
  Home,
  MessageSquare,
  Lock,
  Moon,
  Sun,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { authClient } from "@/lib/auth-client"

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useConvexAuth()
  // Better Auth session — used only for sign out and display info
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const router = useRouter()
  const pathname = usePathname()

  // Redirect must be inside useEffect — never call router in render body
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const redirectPath = pathname || "/admin"
      router.replace(`/auth/login?redirect=${encodeURIComponent(redirectPath)}`)
    }
  }, [isLoading, isAuthenticated, pathname, router])

  // Show spinner while:
  // 1. Convex is validating the token (isLoading)
  // 2. Not yet authenticated (redirect is in progress)
  // 3. Better Auth session is still resolving
  if (isLoading || !isAuthenticated || sessionPending) {
    return (
      <div className="relative min-h-screen w-full bg-background text-foreground flex flex-col justify-center items-center gap-4 overflow-hidden p-4">
        {/* Subtle decorative background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col items-center gap-3">
          <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm shadow-primary/20">
            <Loader2 className="size-6 animate-spin" />
          </div>
          <p className="text-sm font-semibold tracking-tight text-foreground">
            Authenticating Session...
          </p>
          <p className="text-xs text-muted-foreground">
            Verifying your security credentials
          </p>
        </div>
      </div>
    )
  }

  // Only reaches here when Convex has confirmed authentication
  return <AdminRoleCheck session={session}>{children}</AdminRoleCheck>
}

function AdminRoleCheck({
  children,
  session,
}: {
  children: React.ReactNode
  session: any
}) {
  const userProfile = useQuery(api.users.getCurrentUserWithProfile)
  const ensureProfile = useMutation(api.users.ensureCurrentUserProfile)
  const router = useRouter()
  const [dark, setDark] = useState(true)

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark")
    setDark(isDark)
  }, [])

  const toggleTheme = () => {
    const nextDark = !dark
    setDark(nextDark)
    document.documentElement.classList.toggle("dark", nextDark)
  }

  useEffect(() => {
    if (userProfile && !userProfile.profile) {
      ensureProfile().catch(console.error)
    }
  }, [userProfile, ensureProfile])

  if (userProfile === undefined) {
    return (
      <div className="relative min-h-screen w-full bg-background text-foreground flex flex-col justify-center items-center gap-4 overflow-hidden p-4">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col items-center gap-3">
          <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm shadow-primary/20">
            <Loader2 className="size-6 animate-spin" />
          </div>
          <p className="text-sm font-semibold tracking-tight text-foreground">
            Verifying Administrative Privileges...
          </p>
          <p className="text-xs text-muted-foreground">
            Checking role permissions
          </p>
        </div>
      </div>
    )
  }

  // If user does NOT have "admin" or "editor" role, show unauthorized card
  if (userProfile === null || (userProfile.role !== "admin" && userProfile.role !== "editor")) {
    const email =
      session?.user?.email ||
      userProfile?.user?.email ||
      userProfile?.profile?.email ||
      "Not available"
    const name =
      session?.user?.name ||
      userProfile?.user?.name ||
      userProfile?.profile?.name ||
      "Authenticated User"
    const role = userProfile?.role || "user"
    const profilePic =
      session?.user?.image ||
      userProfile?.profile?.profilePic ||
      userProfile?.user?.image

    const initials = name
      .split(" ")
      .map((n: string) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U"

    return (
      <div className="relative min-h-screen w-full bg-background text-foreground flex flex-col justify-between items-center p-4 sm:p-6 lg:p-8 overflow-x-hidden selection:bg-primary/20">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-destructive/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Bar */}
        <header className="relative w-full max-w-4xl flex items-center justify-between pb-6">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="size-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
              <span className="font-bold text-sm tracking-tighter">LF</span>
            </div>
            <span className="font-bold text-sm tracking-tight group-hover:text-primary transition-colors">
              Linksys Fiber Networks
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="rounded-xl size-9 p-0 border-border bg-card/60 backdrop-blur-sm shadow-xs"
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="size-4 text-amber-500" /> : <Moon className="size-4 text-indigo-500" />}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await authClient.signOut()
                router.push("/auth/login?redirect=/admin")
                router.refresh()
              }}
              className="rounded-xl text-xs gap-1.5 h-9 border-border bg-card/60 backdrop-blur-sm shadow-xs hover:text-destructive transition-colors"
            >
              <LogOut className="size-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </header>

        {/* Main Unauthorized Card */}
        <main className="relative w-full max-w-lg my-auto animate-in fade-in zoom-in-95 duration-300">
          <div className="rounded-3xl border border-border/80 bg-card/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-black/10 text-center space-y-6">
            
            {/* Warning Shield Badge with glowing ring */}
            <div className="relative mx-auto size-20">
              <div className="absolute inset-0 rounded-3xl bg-destructive/20 animate-ping opacity-30" />
              <div className="relative size-full rounded-3xl bg-destructive/10 border border-destructive/30 text-destructive flex items-center justify-center shadow-lg shadow-destructive/10">
                <ShieldAlert className="size-10 stroke-[2.2]" />
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-[11px] font-bold uppercase tracking-wider">
                <Lock className="size-3" />
                Access Restricted
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Unauthorized Access
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                You do not have administrative permissions to view or manage the Linksys Fiber Networks admin dashboard.
              </p>
            </div>

            {/* Current Signed-In Identity Card */}
            <div className="rounded-2xl border border-border/70 bg-muted/40 p-4 text-left space-y-3 backdrop-blur-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  Current Signed-in Account
                </span>
                <Badge
                  variant="outline"
                  className="text-[10px] uppercase font-bold py-0.5 px-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                >
                  Role: {role}
                </Badge>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <div className="relative size-11 shrink-0 overflow-hidden rounded-full border border-border bg-primary/10 text-primary font-bold text-sm flex items-center justify-center">
                  {profilePic ? (
                    <img src={profilePic} alt={name} className="size-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-foreground truncate">{name}</p>
                  <p className="text-xs text-muted-foreground truncate font-mono">{email}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-border/60 text-[11px] text-muted-foreground">
                Only accounts assigned an <strong className="text-foreground font-semibold">Administrator</strong> or{" "}
                <strong className="text-foreground font-semibold">Editor</strong> role can access management controls.
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5 pt-2">
              <Button
                variant="default"
                size="lg"
                onClick={() => router.push("/")}
                className="w-full gap-2 rounded-xl font-semibold shadow-md shadow-primary/20"
              >
                <ArrowLeft className="size-4" />
                Return to Public Website
              </Button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="default"
                  onClick={async () => {
                    await authClient.signOut()
                    router.push("/auth/login?redirect=/admin")
                    router.refresh()
                  }}
                  className="w-full gap-2 rounded-xl text-xs font-semibold"
                >
                  <LogOut className="size-3.5" />
                  Switch Account
                </Button>

                <Button
                  variant="outline"
                  size="default"
                  asChild
                  className="w-full gap-2 rounded-xl text-xs font-semibold"
                >
                  <Link href="/#contact">
                    <MessageSquare className="size-3.5" />
                    Contact Support
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="relative w-full max-w-4xl text-center pt-6 text-[11px] text-muted-foreground">
          <p>© {new Date().getFullYear()} Linksys Fiber Networks. All rights reserved.</p>
        </footer>
      </div>
    )
  }

  return <>{children}</>
}