import { unstable_cache } from 'next/cache'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'
import { WebsiteContent } from '@/lib/types/content'

/**
 * Server-side cached fetcher for website content from Convex DB.
 * Uses Next.js Data Cache (unstable_cache) tagged with 'website-content'.
 * Revalidates only when explicitly purged via revalidateTag('website-content').
 */
export const getWebsiteContentServer = unstable_cache(
  async (): Promise<WebsiteContent | null> => {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL
    if (!convexUrl) {
      console.warn('Convex URL is not defined in environment variables.')
      return null
    }

    try {
      const client = new ConvexHttpClient(convexUrl)
      const data = await client.query(api.content.get)
      return (data as WebsiteContent) || null
    } catch (error) {
      console.error('Error fetching website content from Convex DB:', error)
      return null
    }
  },
  ['website-content-key'],
  {
    tags: ['website-content'],
  }
)
