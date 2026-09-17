import { ProjectContent } from '@/components/ProjectContent'
import { getWebsiteContentServer } from '@/lib/get-website-content'

interface ProjectPageProps {
  params: Promise<{ id: string }>
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { id } = await params
  const initialData = await getWebsiteContentServer()
  return <ProjectContent id={id} initialData={initialData} />
}
