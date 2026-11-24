import TagPostList from '@/features/posts/components/TagPostList'
import { getTagBySlug } from '@/external/repositories/tagRepository.server'

export default async function TagPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const tag = await getTagBySlug(slug)

  return (
    <div className="min-h-screen font-sans">
      <TagPostList tagSlug={slug} tagName={tag?.name ?? null} />
    </div>
  )
}
