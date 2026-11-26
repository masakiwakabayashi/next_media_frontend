// server-side only: ログインユーザーのセッション（Cookie）を引き継ぎ、RLS を
// 適用した状態で posts を読み取るためのリポジトリ。
// クライアントコンポーネントからは import しないこと（next/headers を経由するため）。
//
// 公開済み記事の読み取り（一覧・詳細）は mobile と共有するため shared にある。
// ここではサーバー用のクライアントを作って shared の関数に渡す。
// 下書き・編集用・メタデータ用の読み取りは web 専用なので、ここに直接書いている。
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { attachImageUrls } from 'shared/external/repositories/storageRepository'
import * as sharedPostRepository from 'shared/external/repositories/postRepository'
import type {
  PostSummary,
  Post,
  PostsCursor,
  PostsPage,
  PostMeta,
  PostForEdit,
  PostOption,
} from '@/types/post'

// 型定義は types/post.ts（読み取り用の型は shared/src/types/post.ts）に集約している。

export const POSTS_PAGE_SIZE = sharedPostRepository.POSTS_PAGE_SIZE

// 無限スクロール用のカーソルページネーション（公開済み記事・キーワード検索）。
export async function getPostsPage(params: {
  query?: string
  cursor?: PostsCursor | null
  pageSize?: number
}): Promise<PostsPage> {
  return sharedPostRepository.getPostsPage(await createServerSupabaseClient(), params)
}

// カテゴリー（slug）に属する公開記事の1ページ分を取得する。
export async function getPostsByCategoryPage(params: {
  categorySlug: string
  cursor?: PostsCursor | null
  pageSize?: number
}): Promise<PostsPage> {
  return sharedPostRepository.getPostsByCategoryPage(await createServerSupabaseClient(), params)
}

// タグ（slug）に紐づく公開記事の1ページ分を取得する。
export async function getPostsByTagPage(params: {
  tagSlug: string
  cursor?: PostsCursor | null
  pageSize?: number
}): Promise<PostsPage> {
  return sharedPostRepository.getPostsByTagPage(await createServerSupabaseClient(), params)
}

export async function getPost(slug: string): Promise<Post | null> {
  return sharedPostRepository.getPost(await createServerSupabaseClient(), slug)
}

// ---- ここから下は web 専用 ----

// ページのメタデータ（title / description / OGP）用。
export async function getPostMetaBySlug(slug: string): Promise<PostMeta | null> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('posts')
    .select('title, content, image_path')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error) {
    return null
  }

  return data
}

export async function getDraftPostForEdit(slug: string): Promise<PostForEdit | null> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      slug,
      image_path,
      content,
      status,
      published_at,
      category_id,
      author_id,
      post_tags(
        tag:tags(id, name, slug)
      )
    `)
    .eq('slug', slug)
    .eq('status', 'draft')
    .single()

  if (error) {
    console.error('Error fetching draft post for edit:', error)
    return null
  }

  return data
}

export async function getPublishedPostForEdit(slug: string): Promise<PostForEdit | null> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      slug,
      image_path,
      content,
      status,
      published_at,
      category_id,
      author_id,
      post_tags(
        tag:tags(id, name, slug)
      )
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error) {
    console.error('Error fetching published post for edit:', error)
    return null
  }

  return data
}

// 特集への記事紐付けなど、公開記事から選ばせるための選択肢一覧。
export async function getPostOptions(): Promise<PostOption[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('posts')
    .select('id, title, slug')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (error) {
    console.error('Error fetching post options:', error)
    return []
  }

  return data || []
}

export async function getDraftPosts(): Promise<PostSummary[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      slug,
      image_path,
      content,
      status,
      published_at,
      created_at,
      author:profiles(display_name),
      category:categories(name, slug),
      post_tags(
        tag:tags(id, name, slug)
      )
    `)
    .eq('status', 'draft')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching draft posts:', error)
    return []
  }

  return attachImageUrls(supabase, data || [])
}
