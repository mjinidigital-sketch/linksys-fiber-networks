import { ServiceContent } from '@/components/ServiceContent'
import { getWebsiteContentServer } from '@/lib/get-website-content'

interface ServicePageProps {
  params: Promise<{ id: string }>
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { id } = await params
  const initialData = await getWebsiteContentServer()
  return <ServiceContent id={id} initialData={initialData} />
}
