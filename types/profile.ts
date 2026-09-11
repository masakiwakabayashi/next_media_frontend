// profiles に関する、コンポーネントとリポジトリの双方から参照する型定義。
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

// 管理者のユーザー一覧表示用。UserProfile に Supabase Auth 側のステータスを合成したもの。
export type UserProfileWithAuthStatus = UserProfile & {
  email?: string
  banned?: boolean
  isAdmin?: boolean
}
