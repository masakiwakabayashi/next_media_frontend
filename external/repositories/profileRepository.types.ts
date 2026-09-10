// profiles リポジトリ（client / server 共通）の型定義。
export type Author = {
  id: string
  display_name: string
}

export type UserProfile = {
  id: string
  user_id: string | null
  display_name: string
  bio: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}
