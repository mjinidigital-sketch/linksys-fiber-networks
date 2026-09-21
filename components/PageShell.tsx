'use client'

import { useWebsiteContent } from '@/hooks/use-website-content'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { PageBlockRenderer } from '@/components/PageBlockRenderer'
import { WebsiteContent } from '@/lib/types/content'

interface PageShellProps {
  path: string
  className?: string
  initialData?: WebsiteContent | null
}

/**
 * Shared client shell for all pages.
 * Accepts server-cached initialData from Server Components to guarantee
 * zero-layout-shift instant renders directly from Convex DB.
 *
 * Optimisations:
 * - Skeleton is only shown when there is NO data at all (no SSR initialData
 *   AND Convex hasn't responded yet). When initialData is present the page
 *   renders instantly with zero flash.
 * - Footer moved outside <main> for correct HTML landmark semantics.
 */
export function PageShell({
  path,
  className = 'mx-auto max-w-7xl px-4 sm:px-6 md:px-8 lg:px-12',
  initialData,
}: PageShellProps) {
  const { content, loading } = useWebsiteContent(initialData)

  // Show skeleton only when we truly have no content yet (SSR data also absent)
  if (loading && !content) {
    return (
      <div className="min-h-screen flex flex-col w-full bg-background animate-pulse">
        <div className="h-16 w-full border-b border-border/40 bg-card/20" />
        <main className={`flex-1 w-full ${className} py-12`}>
          <div className="h-10 w-48 bg-muted/30 rounded-lg mb-6" />
          <div className="h-6 w-96 bg-muted/20 rounded-md mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-64 bg-muted/20 rounded-xl" />
            <div className="h-64 bg-muted/20 rounded-xl" />
            <div className="h-64 bg-muted/20 rounded-xl" />
          </div>
        </main>
      </div>
    )
  }

  if (!content) return null

  return (
    <div className="min-h-screen flex flex-col w-full">
      <Navbar navigation={content.navigation} general={content.general} />
      <main className={`flex-1 w-full ${className}`}>
        <PageBlockRenderer path={path} content={content} />
      </main>
      <Footer footer={content.footer} general={content.general} />
    </div>
  )
}
