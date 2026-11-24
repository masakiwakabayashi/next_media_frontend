'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createPost, attachTagsToPost } from '@/external/repositories/postRepository'
import { createPostSchema, postTagIdsSchema } from '@/external/schemas/postSchema'

export async function createPostAction(
  data: unknown,
  tagIds: unknown = []
): Promise<{ data: { id: string } | null; error: string | null }> {
  const parsedData = createPostSchema.safeParse(data)

  if (!parsedData.success) {
    return { data: null, error: parsedData.error.issues[0]?.message ?? '入力内容が不正です' }
  }

  const parsedTagIds = postTagIdsSchema.safeParse(tagIds)

  if (!parsedTagIds.success) {
    return { data: null, error: 'タグの指定が不正です' }
  }

  const supabase = await createServerSupabaseClient()
  const { data: post, error } = await createPost(supabase, parsedData.data)

  if (error || !post) {
    return { data: null, error }
  }

  if (parsedTagIds.data.length > 0) {
    const { error: tagError } = await attachTagsToPost(supabase, post.id, parsedTagIds.data)

    if (tagError) {
      return { data: null, error: tagError }
    }
  }

  revalidatePath('/')
  revalidatePath('/admin')

  return { data: post, error: null }
}
