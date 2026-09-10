import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import type { CreatePostData } from './postRepository.types'

// 読み取り（サーバーコンポーネントから利用）は postRepository.server.ts を参照。
// このファイルはクライアントコンポーネントから呼ばれる書き込み系のみを持つ。
// 型定義は postRepository.types.ts に集約している。
export type * from './postRepository.types'

export async function updatePost(id: string, data: Partial<CreatePostData>): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('posts')
    .update(data)
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}

export async function updatePostTags(postId: string, tagIds: string[]): Promise<{ error: string | null }> {
  const { error: deleteError } = await supabase
    .from('post_tags')
    .delete()
    .eq('post_id', postId)

  if (deleteError) {
    return { error: deleteError.message }
  }

  if (tagIds.length > 0) {
    const postTags = tagIds.map((tagId) => ({ post_id: postId, tag_id: tagId }))
    const { error: insertError } = await supabase.from('post_tags').insert(postTags)

    if (insertError) {
      return { error: insertError.message }
    }
  }

  return { error: null }
}

export async function uploadPostImage(file: File): Promise<{ path: string | null; error: string | null }> {
  const extension = file.name.split('.').pop()
  const path = `posts/${crypto.randomUUID()}${extension ? `.${extension}` : ''}`

  const { error: uploadError } = await supabase.storage.from('post-images').upload(path, file)

  if (uploadError) {
    return { path: null, error: uploadError.message }
  }

  return { path, error: null }
}

export async function createPost(
  supabase: SupabaseClient,
  data: CreatePostData
): Promise<{ data: { id: string } | null; error: string | null }> {
  const { data: post, error } = await supabase
    .from('posts')
    .insert(data)
    .select('id')
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: post, error: null }
}

export async function attachTagsToPost(
  supabase: SupabaseClient,
  postId: string,
  tagIds: string[]
): Promise<{ error: string | null }> {
  const postTags = tagIds.map((tagId) => ({
    post_id: postId,
    tag_id: tagId,
  }))

  const { error } = await supabase.from('post_tags').insert(postTags)

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}
