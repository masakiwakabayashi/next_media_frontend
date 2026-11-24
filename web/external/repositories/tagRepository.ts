import { supabase } from '@/lib/supabase/client'

// 読み取り（サーバーコンポーネントから利用）は tagRepository.server.ts を参照。
// 型定義は types/tag.ts に集約している。

export async function createTag(data: {
  name: string
  slug: string
}): Promise<{ error: string | null }> {
  const { error } = await supabase.from('tags').insert(data)
  if (error) return { error: error.message }
  return { error: null }
}

export async function updateTag(
  id: string,
  data: { name: string; slug: string }
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('tags').update(data).eq('id', id)
  if (error) return { error: error.message }
  return { error: null }
}

export async function deleteTag(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('tags').delete().eq('id', id)
  if (error) return { error: error.message }
  return { error: null }
}
