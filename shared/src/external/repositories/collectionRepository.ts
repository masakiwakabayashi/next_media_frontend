// 公開済みの collections を読み取るリポジトリ（web と mobile で共有）。
// ログインユーザーとして RLS が適用されたクライアントを引数で受け取る。
// 編集用の読み取りと書き込みは web/external/repositories/collectionRepository.ts にある。
import type { SharedSupabaseClient } from '../supabaseClient'
import { attachImageUrls } from './storageRepository'
import type { Collection, CollectionPost } from '../../types/collection'

export async function getCollections(supabase: SharedSupabaseClient): Promise<Collection[]> {
  const { data, error } = await supabase
    .from('collections')
    .select('id, title, slug, description, image_path, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (error) {
    console.error('Error fetching collections:', error)
    return []
  }

  return attachImageUrls(supabase, data || [])
}

export async function getCollection(
  supabase: SharedSupabaseClient,
  slug: string
): Promise<{ collection: Collection | null; posts: CollectionPost['post'][] }> {
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

  const [collectionWithImage] = await attachImageUrls(supabase, [collection])

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
    return { collection: collectionWithImage, posts: [] }
  }

  const posts = (collectionPosts || [])
    .map((cp) => cp.post)
    .filter((post): post is NonNullable<typeof post> => Boolean(post))

  return { collection: collectionWithImage, posts: await attachImageUrls(supabase, posts) }
}
