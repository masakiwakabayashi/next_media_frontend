// server-side only: サーバーコンポーネントからのみ利用。ログインユーザーの
// セッション（Cookie）を引き継ぎ、RLS を適用した状態で categories を読み取る。
//
// 読み取りの処理は mobile と共有するため shared にある。
// ここではサーバー用のクライアントを作って shared の関数に渡す。
import { createServerSupabaseClient } from '@/lib/supabase/server'
import * as sharedCategoryRepository from 'shared/external/repositories/categoryRepository'
import type { Category } from '@/types/category'

// 型定義は types/category.ts（実体は shared/src/types/category.ts）に集約している。

export async function getCategories(): Promise<Category[]> {
  return sharedCategoryRepository.getCategories(await createServerSupabaseClient())
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return sharedCategoryRepository.getCategoryBySlug(await createServerSupabaseClient(), slug)
}
