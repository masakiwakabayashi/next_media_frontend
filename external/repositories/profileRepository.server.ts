// server-side only: ログインユーザーのセッション（Cookie）を引き継ぎ、RLS を
// 適用した状態で profiles を読み取るためのリポジトリ。
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Author, UserProfile } from '@/types/profile'

// 型定義は types/profile.ts に集約している。

export async function getUserProfiles(): Promise<UserProfile[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, user_id, display_name, bio, avatar_url, created_at, updated_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user profiles:', error)
    return []
  }

  return data || []
}

export async function getAuthors(): Promise<Author[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name')
    .order('display_name')

  if (error) {
    console.error('Error fetching authors:', error)
    return []
  }

  return data || []
}
