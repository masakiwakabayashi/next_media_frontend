// categories を読み取るリポジトリ（web と mobile で共有）。
// ログインユーザーとして RLS が適用されたクライアントを引数で受け取る。
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../database/database.types'
import type { Category } from '../../types/category'

export async function getCategories(supabase: SupabaseClient<Database>): Promise<Category[]> {
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

export async function getCategoryBySlug(
  supabase: SupabaseClient<Database>,
  slug: string
): Promise<Category | null> {
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
