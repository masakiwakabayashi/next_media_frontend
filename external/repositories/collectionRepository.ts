// server-side only: サーバーコンポーネントからのみ利用。ログインユーザーの
// セッション（Cookie）を引き継ぎ、RLS を適用した状態で collections を読み取る。
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type {
  Collection,
  CollectionPost,
  CollectionLinkedPost,
  CollectionForEdit,
} from './collectionRepository.types'

// 型定義は collectionRepository.types.ts に集約している。
export type * from './collectionRepository.types'

export async function getCollections(): Promise<Collection[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('collections')
    .select('id, title, slug, description, image_path, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (error) {
    console.error('Error fetching collections:', error)
    return []
  }

  return data || []
}

export async function getCollection(
  slug: string
): Promise<{ collection: Collection | null; posts: CollectionPost['post'][] }> {
  const supabase = await createServerSupabaseClient()
  const { data: collection, error: collectionError } = await supabase
    .from('collections')
    .select('id, title, slug, description, image_path, published_at')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (collectionError || !collection) {
    console.error('Error fetching collection:', collectionError)
    return { collection: null, posts: [] }
  }

  const { data: collectionPosts, error: postsError } = await supabase
    .from('collection_posts')
    .select(
      `
      position,
      post:posts(
        id,
        title,
        slug,
        image_path,
        content,
        published_at,
        category:categories(name, slug)
      )
    `
    )
    .eq('collection_id', collection.id)
    .order('position', { ascending: true })

  if (postsError) {
    console.error('Error fetching collection posts:', postsError)
    return { collection, posts: [] }
  }

  const posts = (collectionPosts || [])
    .map((cp) => cp.post)
    .filter(Boolean)

  return { collection, posts }
}

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
