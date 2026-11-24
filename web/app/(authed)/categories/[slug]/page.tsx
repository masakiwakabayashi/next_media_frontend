import CategoryPostList from '@/features/posts/components/CategoryPostList'
import { getCategoryBySlug } from '@/external/repositories/categoryRepository'

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)

  return (
    <div className="min-h-screen font-sans">
      <CategoryPostList
        categorySlug={slug}
        categoryName={category?.name ?? null}
      />
    </div>
  )
}
