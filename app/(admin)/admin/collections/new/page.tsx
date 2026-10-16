import { Metadata } from 'next'
import CollectionCreate from '@/features/collections/components/CollectionCreate'
import { getPostOptions } from '@/external/repositories/postRepository.server'

export const metadata: Metadata = {
  title: '特集を作成',
}

export default async function NewCollectionPage() {
  const postOptions = await getPostOptions()

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        特集を作成
      </h1>
      <CollectionCreate postOptions={postOptions} />
    </div>
  )
}
