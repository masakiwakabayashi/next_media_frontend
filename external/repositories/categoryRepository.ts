// server-side only: サーバーコンポーネントからのみ利用。ログインユーザーの
// セッション（Cookie）を引き継ぎ、RLS を適用した状態で categories を読み取る。
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Category } from '@/types/category'

// 型定義は types/category.ts に集約している。

export async function getCategories(): Promise<Category[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name')

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return data || []
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('slug', slug)
    .maybeSingle()

  if (error) {
    console.error('Error fetching category by slug:', error)
    return null
  }

  return data
}
