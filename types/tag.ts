// tags に関する、コンポーネントとリポジトリの双方から参照する型定義。
export type Tag = {
  id: string
  name: string
  slug: string
  created_at: string
}

export type TagWithCount = Tag & {
  postCount: number
}
