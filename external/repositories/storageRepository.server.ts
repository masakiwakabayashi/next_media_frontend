// server-side only: post-images バケットの画像を表示するための署名付きURLを発行する。
// post-images は private バケットのため公開URLでは表示できない。
// ログインユーザーのセッションで発行するので、未ログインユーザーは RLS により発行できない。
import type { createServerSupabaseClient } from '@/lib/supabase/server'

type ServerSupabaseClient = Awaited<ReturnType<typeof createServerSupabaseClient>>

const POST_IMAGES_BUCKET = 'post-images'
const SIGNED_URL_EXPIRES_IN = 60 * 60

// image_path はシード等の public/ 配下の相対パス（"/images/..."）、外部URL、
// または Supabase Storage 上のオブジェクトキーのいずれか。署名が必要なのはオブジェクトキーのみ。
function isStorageKey(path: string): boolean {
  return !/^(\/|https?:|blob:|data:)/.test(path)
}

// 各要素の image_path から表示用の image_url を付与する。
// オブジェクトキーは createSignedUrls で1回の通信にまとめて署名する。
export async function attachImageUrls<T extends { image_path: string | null }>(
  supabase: ServerSupabaseClient,
  items: T[]
): Promise<(T & { image_url: string | null })[]> {
  const keys = [
    ...new Set(
      items
        .map((item) => item.image_path)
        .filter((path): path is string => path !== null && isStorageKey(path))
    ),
  ]

  const signedUrls = new Map<string, string>()
  if (keys.length > 0) {
    const { data, error } = await supabase.storage
      .from(POST_IMAGES_BUCKET)
      .createSignedUrls(keys, SIGNED_URL_EXPIRES_IN)

    if (error) {
      console.error('Error creating signed urls:', error)
    }

    for (const signed of data ?? []) {
      if (signed.path && signed.signedUrl && !signed.error) {
        signedUrls.set(signed.path, signed.signedUrl)
      }
    }
  }

  return items.map((item) => ({
    ...item,
    image_url: resolveImageUrl(item.image_path, signedUrls),
  }))
}

function resolveImageUrl(path: string | null, signedUrls: Map<string, string>): string | null {
  if (!path) return null
  if (!isStorageKey(path)) return path
  return signedUrls.get(path) ?? null
}
