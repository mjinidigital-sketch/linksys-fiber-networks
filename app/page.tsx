import { PageShell } from '@/components/PageShell'
import { getWebsiteContentServer } from '@/lib/get-website-content'

// Revalidate SSR cache every 60 seconds (ISR) so the page
// is served from cache on subsequent requests.
export const revalidate = 60

export default async function HomePage() {
  const initialData = await getWebsiteContentServer()

  return (
    <PageShell
      path="/"
      className="mx-auto max-w-7xl ml-2.5 md:ml-0 px-4 sm:px-6 md:px-8 lg:px-12 mt-6"
      initialData={initialData}
    />
  )
}
