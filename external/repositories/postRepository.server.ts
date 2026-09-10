// server-side only: ログインユーザーのセッション（Cookie）を引き継ぎ、RLS を
// 適用した状態で posts を読み取るためのリポジトリ。
// クライアントコンポーネントからは import しないこと（next/headers を経由するため）。
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type {
  PostSummary,
  Post,
  PostsCursor,
  PostsPage,
  PostMeta,
  PostForEdit,
  PostOption,
} from './postRepository.types'

// 型定義は postRepository.types.ts に集約している。
export type * from './postRepository.types'

const POST_LIST_SELECT = `
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
`

export const POSTS_PAGE_SIZE = 20

// (published_at, id) 降順カーソルより後ろの行に絞る or() フィルタ文字列。
function cursorOrFilter(cursor: PostsCursor): string {
  return `published_at.lt."${cursor.publishedAt}",and(published_at.eq."${cursor.publishedAt}",id.lt."${cursor.id}")`
}

// pageSize + 1 件取得した rows から、1ページ分の posts と次カーソルを組み立てる。
function buildPostsPage(rows: PostSummary[], pageSize: number): PostsPage {
  const hasMore = rows.length > pageSize
  const posts = hasMore ? rows.slice(0, pageSize) : rows
  const tail = posts[posts.length - 1]
  const nextCursor =
    hasMore && tail?.published_at
      ? { publishedAt: tail.published_at, id: tail.id }
      : null

  return { posts, nextCursor }
}

// 無限スクロール用のカーソルページネーション。
// published_at 降順・id 降順で並べ、cursor 以降を pageSize 件返す。
// pageSize + 1 件取得して「次ページがあるか」を判定する。
export async function getPostsPage({
  query,
  cursor,
  pageSize = POSTS_PAGE_SIZE,
}: {
  query?: string
  cursor?: PostsCursor | null
  pageSize?: number
}): Promise<PostsPage> {
  const supabase = await createServerSupabaseClient()

  let builder = supabase
    .from('posts')
    .select(POST_LIST_SELECT)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(pageSize + 1)

  const term = query?.trim()
  if (term) {
    // or() のフィルタ文字列を壊す文字を除去してから部分一致検索する。
    const safe = term.replace(/["\\(),*]/g, ' ').trim()
    if (safe) {
      builder = builder.or(`title.ilike."*${safe}*",content.ilike."*${safe}*"`)
    }
  }

  if (cursor) {
    builder = builder.or(cursorOrFilter(cursor))
  }

  const { data, error } = await builder

  if (error) {
    console.error('Error fetching posts page:', error)
    return { posts: [], nextCursor: null }
  }

  return buildPostsPage(data ?? [], pageSize)
}

// カテゴリー（slug）に属する公開記事の1ページ分をカーソルページネーションで取得する。
export async function getPostsByCategoryPage({
  categorySlug,
  cursor,
  pageSize = POSTS_PAGE_SIZE,
}: {
  categorySlug: string
  cursor?: PostsCursor | null
  pageSize?: number
}): Promise<PostsPage> {
  const supabase = await createServerSupabaseClient()

  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .maybeSingle()

  if (categoryError) {
    console.error('Error fetching category by slug:', categoryError)
    return { posts: [], nextCursor: null }
  }

  if (!category) {
    return { posts: [], nextCursor: null }
  }

  let builder = supabase
    .from('posts')
    .select(POST_LIST_SELECT)
    .eq('status', 'published')
    .eq('category_id', category.id)
    .order('published_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(pageSize + 1)

  if (cursor) {
    builder = builder.or(cursorOrFilter(cursor))
  }

  const { data, error } = await builder

  if (error) {
    console.error('Error fetching posts page by category:', error)
    return { posts: [], nextCursor: null }
  }

  return buildPostsPage(data ?? [], pageSize)
}

// タグ（slug）に紐づく公開記事の1ページ分をカーソルページネーションで取得する。
// post_tags を直接フィルタすると付随タグが欠落するため、まず post_id を集めてから
// その id 集合で posts を引く2段構成にしている。
export async function getPostsByTagPage({
  tagSlug,
  cursor,
  pageSize = POSTS_PAGE_SIZE,
}: {
  tagSlug: string
  cursor?: PostsCursor | null
  pageSize?: number
}): Promise<PostsPage> {
  const supabase = await createServerSupabaseClient()

  const { data: links, error: linkError } = await supabase
    .from('post_tags')
    .select('post_id, tags!inner(slug)')
    .eq('tags.slug', tagSlug)

  if (linkError) {
    console.error('Error fetching post ids by tag:', linkError)
    return { posts: [], nextCursor: null }
  }

  const postIds = [...new Set((links ?? []).map((row) => row.post_id))]
  if (postIds.length === 0) {
    return { posts: [], nextCursor: null }
  }

  let builder = supabase
    .from('posts')
    .select(POST_LIST_SELECT)
    .eq('status', 'published')
    .in('id', postIds)
    .order('published_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(pageSize + 1)

  if (cursor) {
    builder = builder.or(cursorOrFilter(cursor))
  }

  const { data, error } = await builder

  if (error) {
    console.error('Error fetching posts page by tag:', error)
    return { posts: [], nextCursor: null }
  }

  return buildPostsPage(data ?? [], pageSize)
}

export async function getPost(slug: string): Promise<Post | null> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      slug,
      image_path,
      content,
      google_maps_url,
      status,
      published_at,
      created_at,
      author:profiles(display_name, bio, avatar_url),
      category:categories(name, slug),
      post_tags(
        tag:tags(id, name, slug)
      )
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error) {
    console.error('Error fetching post:', error)
    return null
  }

  return data
}

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

  return data || []
}
