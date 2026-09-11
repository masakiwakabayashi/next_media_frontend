// server-side only: ログインユーザーのセッション（Cookie）を引き継ぎ、RLS を
// 適用した状態で tags を読み取るためのリポジトリ。
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Tag, TagWithCount } from '@/types/tag'

// 型定義は types/tag.ts に集約している。

export async function getTags(): Promise<TagWithCount[]> {
  const supabase = await createServerSupabaseClient()
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

export async function getTagBySlug(slug: string): Promise<Tag | null> {
  const supabase = await createServerSupabaseClient()
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

export async function getTagOptions(): Promise<Tag[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('tags')
    .select('id, name, slug, created_at')
    .order('name')

  if (error) {
    console.error('Error fetching tags:', error)
    return []
  }

  return data || []
}
