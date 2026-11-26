// server-side only: サーバーコンポーネントからのみ利用。ログインユーザーの
// セッション（Cookie）を引き継ぎ、RLS を適用した状態で collections を読み取る。
//
// 公開済みコレクションの読み取り（一覧・詳細）は mobile と共有するため shared にある。
// ここではサーバー用のクライアントを作って shared の関数に渡す。
// 編集用の読み取りと書き込みは web 専用なので、ここに直接書いている。
import type { SupabaseClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import * as sharedCollectionRepository from 'shared/external/repositories/collectionRepository'
import type {
  Collection,
  CollectionPost,
  CollectionLinkedPost,
  CollectionForEdit,
  CreateCollectionData,
} from '@/types/collection'

// 型定義は types/collection.ts（読み取り用の型は shared/src/types/collection.ts）に集約している。

export async function getCollections(): Promise<Collection[]> {
  return sharedCollectionRepository.getCollections(await createServerSupabaseClient())
}

export async function getCollection(
  slug: string
): Promise<{ collection: Collection | null; posts: CollectionPost['post'][] }> {
  return sharedCollectionRepository.getCollection(await createServerSupabaseClient(), slug)
}

// ---- ここから下は web 専用 ----

export async function getCollectionForEdit(
  slug: string
): Promise<CollectionForEdit | null> {
  const supabase = await createServerSupabaseClient()
  const { data: collection, error } = await supabase
    .from('collections')
    .select('id, title, slug, description, image_path, status, published_at')
    .eq('slug', slug)
    .single()

  if (error || !collection) {
    console.error('Error fetching collection for edit:', error)
    return null
  }

  const { data: links, error: linksError } = await supabase
    .from('collection_posts')
    .select('position, post:posts(id, title, slug)')
    .eq('collection_id', collection.id)
    .order('position', { ascending: true })

  if (linksError) {
    console.error('Error fetching collection posts for edit:', linksError)
    return { ...collection, posts: [] }
  }

  const posts = (links || [])
    .map((link) => link.post)
    .filter((post): post is CollectionLinkedPost => Boolean(post))

  return { ...collection, posts }
}

// 以下は Server Action（external/handler/collection）から、呼び出し元の
// セッションを引き継いだ supabase クライアントを受け取って書き込む。

export async function createCollection(
  supabase: SupabaseClient,
  data: CreateCollectionData
): Promise<{ data: { id: string } | null; error: string | null }> {
  const { data: collection, error } = await supabase
    .from('collections')
    .insert(data)
    .select('id')
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: collection, error: null }
}

// 渡された順序で position 0..n-1 を振って collection_posts に insert する。
export async function attachPostsToCollection(
  supabase: SupabaseClient,
  collectionId: string,
  postIds: string[]
): Promise<{ error: string | null }> {
  const rows = postIds.map((postId, index) => ({
    collection_id: collectionId,
    post_id: postId,
    position: index,
  }))

  const { error } = await supabase.from('collection_posts').insert(rows)

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}
