import { Metadata } from 'next'
import PostCreate from '@/features/posts/components/PostCreate'
import { getCategories } from '@/external/repositories/categoryRepository'
import { getAuthors } from '@/external/repositories/profileRepository.server'
import { getTagOptions } from '@/external/repositories/tagRepository.server'

export const metadata: Metadata = {
  title: '記事を作成',
}

export default async function NewPostPage() {
  const [categories, authors, tags] = await Promise.all([
    getCategories(),
    getAuthors(),
    getTagOptions(),
  ])

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        記事を作成
      </h1>
      <PostCreate
        categories={categories}
        authors={authors}
        tags={tags}
        redirectTo="/admin/posts/drafts"
      />
    </div>
  )
}
