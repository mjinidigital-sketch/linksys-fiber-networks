// import { unstable_cache } from 'next/cache'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'
import { WebsiteContent } from '@/lib/types/content'

/**
 * Server-side fetcher for website content from Convex DB.
 *
 * TODO: After first production deployment is verified and DB is seeded,
 * re-enable Next.js Data Cache by wrapping this in unstable_cache again:
 *
 * export const getWebsiteContentServer = unstable_cache(
 *   async () => fetchContent(),
 *   ['website-content-key'],
 *   { tags: ['website-content'] }
 * )
 *
 * For now: always fetches live from Convex (force-dynamic safe).
 */
async function fetchContent(): Promise<WebsiteContent | null> {
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
}

export const getWebsiteContentServer = fetchContent
