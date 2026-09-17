import { BlogPostContent } from '@/components/BlogPostContent'
import { getWebsiteContentServer } from '@/lib/get-website-content'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export default async function BlogPostDetailPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const initialData = await getWebsiteContentServer()
  return <BlogPostContent slug={slug} initialData={initialData} />
}
