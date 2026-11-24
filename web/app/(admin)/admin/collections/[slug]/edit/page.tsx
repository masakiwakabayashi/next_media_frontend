import { notFound } from 'next/navigation'
import CollectionEdit from '@/features/collections/components/CollectionEdit'
import { getCollectionForEdit } from '@/external/repositories/collectionRepository'
import { getPostOptions } from '@/external/repositories/postRepository.server'

type Props = {
  params: Promise<{ slug: string }>
}

export default async function CollectionEditPage({ params }: Props) {
  const { slug } = await params

  const [collection, postOptions] = await Promise.all([
    getCollectionForEdit(slug),
    getPostOptions(),
  ])

  if (!collection) {
    notFound()
  }

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        特集を編集
      </h1>
      <CollectionEdit collection={collection} postOptions={postOptions} />
    </div>
  )
}
