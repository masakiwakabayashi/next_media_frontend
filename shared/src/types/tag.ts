// tags の読み取りで使う型定義。
export type Tag = {
  id: string
  name: string
  slug: string
  created_at: string
}

export type TagWithCount = Tag & {
  postCount: number
}
