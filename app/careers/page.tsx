import type { Metadata } from 'next'
import { PageShell } from '@/components/PageShell'
import { getWebsiteContentServer } from '@/lib/get-website-content'

export const metadata: Metadata = {
  title: 'Careers & Job Opportunities | Linksys Fiber Networks',
  description:
    'Explore open positions, apply online, and join our growing team at Linksys Fiber Networks in Molo.',
}

export default async function CareersPage() {
  const initialData = await getWebsiteContentServer()

  return (
    <PageShell
      path="/careers"
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12 mt-6 pb-20"
      initialData={initialData}
    />
  )
}
