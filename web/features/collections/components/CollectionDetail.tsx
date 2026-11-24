import Link from 'next/link'
import EyecatchImage from '@/components/EyecatchImage'
import { getCollection } from '@/external/repositories/collectionRepository'
import { notFound } from 'next/navigation'
import CollectionAdminEditLink from './CollectionAdminEditLink'

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function CollectionDetail({ collectionSlug }: { collectionSlug: string }) {
  const { collection, posts } = await getCollection(collectionSlug)

  if (!collection) {
    notFound()
  }

  return (
    <div>
      <EyecatchImage src={collection.image_url} alt={collection.title} />

      <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        {collection.title}
      </h1>

      {collection.description && (
        <p className="mb-6 text-zinc-600 dark:text-zinc-400">
          {collection.description}
        </p>
      )}

      {/* 編集リンク（管理者のみ） */}
      <div className="mb-6">
        <CollectionAdminEditLink slug={collection.slug} />
      </div>

      {posts.length === 0 ? (
        <div className="py-8 text-center text-zinc-500">
          この特集に記事はありません
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <article
              key={post.id}
              className="rounded-lg border border-zinc-200 p-6 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700"
            >
              <EyecatchImage src={post.image_url} alt={post.title} />

              <div className="mb-2 flex items-center gap-2 text-sm text-zinc-500">
                {post.category && (
                  <Link
                    href={`/categories/${post.category.slug}`}
                    className="rounded bg-zinc-100 px-2 py-0.5 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                  >
                    {post.category.name}
                  </Link>
                )}
                {post.published_at && (
                  <time dateTime={post.published_at}>
                    {formatDate(post.published_at)}
                  </time>
                )}
              </div>

              <Link href={`/posts/${post.slug}`}>
                <h2 className="mb-2 text-xl font-bold text-zinc-900 hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-300">
                  {post.title}
                </h2>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
