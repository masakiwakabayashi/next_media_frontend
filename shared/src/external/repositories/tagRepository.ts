// tags を読み取るリポジトリ（web と mobile で共有）。
// ログインユーザーとして RLS が適用されたクライアントを引数で受け取る。
import type { SharedSupabaseClient } from '../supabaseClient'
import type { Tag, TagWithCount } from '../../types/tag'

export async function getTags(supabase: SharedSupabaseClient): Promise<TagWithCount[]> {
  const { data, error } = await supabase
    .from('tags')
    .select('id, name, slug, created_at, post_tags(count)')
    .order('name')

  if (error) {
    console.error('Error fetching tags:', error)
    return []
  }

  return (data || []).map((tag) => ({
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    created_at: tag.created_at,
    postCount: tag.post_tags?.[0]?.count ?? 0,
  }))
}

export async function getTagBySlug(supabase: SharedSupabaseClient, slug: string): Promise<Tag | null> {
  const { data, error } = await supabase
    .from('tags')
    .select('id, name, slug, created_at')
    .eq('slug', slug)
    .maybeSingle()

  if (error) {
    console.error('Error fetching tag by slug:', error)
    return null
  }

  return data
}
