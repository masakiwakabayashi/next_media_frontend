// tags リポジトリ（client / server 共通）の型定義。
export type Tag = {
  id: string
  name: string
  slug: string
  created_at: string
}

export type TagWithCount = Tag & {
  postCount: number
}
