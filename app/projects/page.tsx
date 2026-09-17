import { PageShell } from '@/components/PageShell'
import { getWebsiteContentServer } from '@/lib/get-website-content'

export default async function ProjectsPage() {
  const initialData = await getWebsiteContentServer()

  return (
    <PageShell
      path="/projects"
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12 mt-6 pb-20"
      initialData={initialData}
    />
  )
}
