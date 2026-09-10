// client-side only: クライアントコンポーネントから呼ばれる collections の書き込み系のみを持つ。
// 読み取り（サーバーコンポーネントから利用）は collectionRepository.ts を参照。
import { supabase } from '@/lib/supabase/client'
import type {
  CollectionForEdit,
  CollectionLinkedPost,
} from './collectionRepository'

export type { CollectionForEdit, CollectionLinkedPost }

export type UpdateCollectionInput = {
  title: string
  slug: string
  description: string | null
  image_path: string | null
  status: 'draft' | 'published' | 'archived'
  published_at: string | null
}

export async function updateCollection(
  id: string,
  data: UpdateCollectionInput
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('collections').update(data).eq('id', id)

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}

// collection_posts をいったん全削除してから、渡された順序で position 0..n-1 を
// 振り直して insert する（updatePostTags と同じ方針。
// (collection_id, position) の一意制約を避けるため個別 UPDATE はしない）。
export async function updateCollectionPosts(
  collectionId: string,
  postIds: string[]
): Promise<{ error: string | null }> {
  const { error: deleteError } = await supabase
    .from('collection_posts')
    .delete()
    .eq('collection_id', collectionId)

  if (deleteError) {
    return { error: deleteError.message }
  }

  if (postIds.length > 0) {
    const rows = postIds.map((postId, index) => ({
      collection_id: collectionId,
      post_id: postId,
      position: index,
    }))
    const { error: insertError } = await supabase
      .from('collection_posts')
      .insert(rows)

    if (insertError) {
      return { error: insertError.message }
    }
  }

  return { error: null }
}
