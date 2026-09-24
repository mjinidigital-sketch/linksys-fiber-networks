"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { api } from "@/convex/_generated/api"
import { useConvexAuth, useQuery, useMutation } from "convex/react"
import { Loader2, ShieldAlert, LogOut, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
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
      <div className="min-h-screen w-full bg-background text-foreground flex flex-col justify-center items-center gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">
          Authenticating session...
        </p>
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

  useEffect(() => {
    if (userProfile && !userProfile.profile) {
      ensureProfile().catch(console.error)
    }
  }, [userProfile, ensureProfile])

  if (userProfile === undefined) {
    return (
      <div className="min-h-screen w-full bg-background text-foreground flex flex-col justify-center items-center gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">
          Verifying administrator privileges...
        </p>
      </div>
    )
  }

  if (userProfile === null || (userProfile.role !== "admin" && userProfile.role !== "editor")) {
    return (
      <div className="min-h-screen w-full bg-background text-foreground flex justify-center items-center p-4">
        <div className="max-w-md w-full rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-2xl text-center space-y-5">
          <div className="size-14 rounded-2xl bg-destructive/10 text-destructive mx-auto flex items-center justify-center">
            <ShieldAlert className="size-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xl font-bold tracking-tight">Access Restricted</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Logged in as{" "}
              <span className="font-semibold text-foreground">
                {session?.user?.email || userProfile?.user?.email || "User"}
              </span>{" "}
              (Role:{" "}
              <span className="capitalize font-medium text-foreground">
                {userProfile?.role || "user"}
              </span>
              ). Only accounts with administrator or editor access can manage this dashboard.
            </p>
          </div>
          <div className="flex flex-col gap-2.5 pt-2">
            <Button
              variant="default"
              onClick={() => router.push("/")}
              className="w-full gap-2 rounded-xl"
            >
              <ArrowLeft className="size-4" />
              Return to Public Site
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                await authClient.signOut()
                router.push("/auth/login?redirect=/admin")
                router.refresh()
              }}
              className="w-full gap-2 rounded-xl"
            >
              <LogOut className="size-4" />
              Sign Out & Switch Account
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}