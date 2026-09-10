import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import type { CreatePostInput } from '@/external/schemas/postSchema'

// 読み取り（サーバーコンポーネントから利用）は postRepository.server.ts を参照。
// このファイルはクライアントコンポーネントから呼ばれる書き込み系のみを持つ。

export type PostSummary = {
  id: string
  title: string
  slug: string
  image_path: string | null
  content: string
  status: 'draft' | 'published' | 'archived'
  published_at: string | null
  created_at: string
  author: {
    display_name: string
  } | null
  category: {
    name: string
    slug: string
  } | null
  post_tags: {
    tag: {
      id: string
      name: string
      slug: string
    }
  }[]
}

export type Post = {
  id: string
  title: string
  slug: string
  image_path: string | null
  content: string
  google_maps_url: string | null
  status: 'draft' | 'published' | 'archived'
  published_at: string | null
  created_at: string
  author: {
    display_name: string
    bio: string | null
    avatar_url: string | null
  } | null
  category: {
    name: string
    slug: string
  } | null
  post_tags: {
    tag: {
      id: string
      name: string
      slug: string
    }
  }[]
}

export type CreatePostData = CreatePostInput

export type PostListResult = {
  posts: PostSummary[]
  totalCount: number
}

// 無限スクロール用のカーソル。(published_at, id) の複合キーで
// 「最後に読み込んだ記事より後ろ」を表す。
export type PostsCursor = {
  publishedAt: string
  id: string
}

export type PostsPage = {
  posts: PostSummary[]
  nextCursor: PostsCursor | null
}

export type PostMeta = {
  title: string
  content: string
  image_path: string | null
}

// セレクトボックス等で記事を選ばせるための軽量な選択肢。
export type PostOption = {
  id: string
  title: string
  slug: string
}

export type PostForEdit = {
  id: string
  title: string
  slug: string
  image_path: string | null
  content: string
  status: 'draft' | 'published' | 'archived'
  published_at: string | null
  category_id: string | null
  author_id: string
  post_tags: {
    tag: {
      id: string
      name: string
      slug: string
    }
  }[]
}

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
