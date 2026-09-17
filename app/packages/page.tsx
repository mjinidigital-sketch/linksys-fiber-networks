import type { Metadata } from 'next'
import { PageShell } from '@/components/PageShell'
import { getWebsiteContentServer } from '@/lib/get-website-content'

export const metadata: Metadata = {
  title: 'Internet Packages | Linksys Fiber Networks',
  description:
    'Explore unlimited internet packages in Molo starting from KSh 1,500/mo. High-speed fiber & WiFi options for homes, students, and businesses.',
}

export default async function PackagesPage() {
  const initialData = await getWebsiteContentServer()

  return (
    <PageShell
      path="/packages"
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12 mt-6 pb-20"
      initialData={initialData}
    />
  )
}