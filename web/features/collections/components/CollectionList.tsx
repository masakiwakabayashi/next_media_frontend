import Link from 'next/link'
import EyecatchImage from '@/components/EyecatchImage'
import { getCollections } from '@/external/repositories/collectionRepository'

export default async function CollectionList() {
  const collections = await getCollections()

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        特集記事
      </h1>

      {collections.length === 0 ? (
        <div className="py-8 text-center text-zinc-500">
          特集記事はありません
        </div>
      ) : (
        <div className="space-y-6">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.slug}`}
              className="block rounded-lg border border-zinc-200 p-6 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700"
            >
              <EyecatchImage src={collection.image_url} alt={collection.title} />

              <h2 className="mb-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {collection.title}
              </h2>

              {collection.description && (
                <p className="text-zinc-600 dark:text-zinc-400">
                  {collection.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
