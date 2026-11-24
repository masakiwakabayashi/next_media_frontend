import { notFound } from 'next/navigation'
import PostEdit from '@/features/posts/components/PostEdit'
import { getPublishedPostForEdit } from '@/external/repositories/postRepository.server'
import { getCategories } from '@/external/repositories/categoryRepository'
import { getTagOptions } from '@/external/repositories/tagRepository.server'

type Props = {
  params: Promise<{ slug: string }>
}

export default async function PublishedPostEditPage({ params }: Props) {
  const { slug } = await params

  const [post, categories, tags] = await Promise.all([
    getPublishedPostForEdit(slug),
    getCategories(),
    getTagOptions(),
  ])

  if (!post) {
    notFound()
  }

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        記事を編集
      </h1>
      <PostEdit post={post} categories={categories} tags={tags} />
    </div>
  )
}
