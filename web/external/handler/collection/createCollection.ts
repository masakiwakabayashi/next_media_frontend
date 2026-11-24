'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import {
  createCollection,
  attachPostsToCollection,
} from '@/external/repositories/collectionRepository'
import {
  createCollectionSchema,
  collectionPostIdsSchema,
} from '@/external/schemas/collectionSchema'

// 管理者以外の insert は collections / collection_posts の RLS で拒否される。
export async function createCollectionAction(
  data: unknown,
  postIds: unknown = []
): Promise<{ data: { id: string } | null; error: string | null }> {
  const parsedData = createCollectionSchema.safeParse(data)

  if (!parsedData.success) {
    return { data: null, error: parsedData.error.issues[0]?.message ?? '入力内容が不正です' }
  }

  const parsedPostIds = collectionPostIdsSchema.safeParse(postIds)

  if (!parsedPostIds.success) {
    return { data: null, error: '記事の指定が不正です' }
  }

  const supabase = await createServerSupabaseClient()
  const { data: collection, error } = await createCollection(supabase, parsedData.data)

  if (error || !collection) {
    return { data: null, error }
  }

  if (parsedPostIds.data.length > 0) {
    const { error: postsError } = await attachPostsToCollection(
      supabase,
      collection.id,
      parsedPostIds.data
    )

    if (postsError) {
      return { data: null, error: postsError }
    }
  }

  revalidatePath('/collections')

  return { data: collection, error: null }
}
