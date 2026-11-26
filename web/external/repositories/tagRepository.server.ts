// server-side only: ログインユーザーのセッション（Cookie）を引き継ぎ、RLS を
// 適用した状態で tags を読み取るためのリポジトリ。
//
// 一覧・slug での取得は mobile と共有するため shared にある。
// ここではサーバー用のクライアントを作って shared の関数に渡す。
// 管理画面のセレクトボックス用（getTagOptions）は web 専用なので、ここに直接書いている。
import { createServerSupabaseClient } from '@/lib/supabase/server'
import * as sharedTagRepository from 'shared/external/repositories/tagRepository'
import type { Tag, TagWithCount } from '@/types/tag'

// 型定義は types/tag.ts（実体は shared/src/types/tag.ts）に集約している。

export async function getTags(): Promise<TagWithCount[]> {
  return sharedTagRepository.getTags(await createServerSupabaseClient())
}

export async function getTagBySlug(slug: string): Promise<Tag | null> {
  return sharedTagRepository.getTagBySlug(await createServerSupabaseClient(), slug)
}

// ---- ここから下は web 専用 ----

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
