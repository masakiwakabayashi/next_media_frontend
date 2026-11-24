import Link from 'next/link'
import AdminSidebarLinks from '@/components/AdminSidebarLinks'
import { getCategories } from '@/external/repositories/categoryRepository'
import { getTagOptions } from '@/external/repositories/tagRepository.server'
import { getCollections } from '@/external/repositories/collectionRepository'

export default async function Sidebar() {
  const [categories, tags, collections] = await Promise.all([
    getCategories(),
    getTagOptions(),
    getCollections(),
  ])

  return (
    <aside className="space-y-8">
      <AdminSidebarLinks />

      {categories.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-zinc-500">
            カテゴリー
          </h3>
          <ul className="space-y-2">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/categories/${category.slug}`}
                  className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tags.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-zinc-500">
            タグ
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tags/${tag.slug}`}
                className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 dark:border-zinc-700 dark:hover:border-zinc-500 dark:hover:text-zinc-300"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {collections.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-zinc-500">
            特集記事
          </h3>
          <ul className="space-y-2">
            {collections.map((collection) => (
              <li key={collection.id}>
                <Link
                  href={`/collections/${collection.slug}`}
                  className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  {collection.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  )
}
