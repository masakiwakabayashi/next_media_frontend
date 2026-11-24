import { z } from 'zod'

export const createCollectionSchema = z.object({
  title: z.string().min(1, 'タイトルを入力してください'),
  slug: z.string().min(1, 'スラッグを入力してください'),
  description: z.string().nullable(),
  image_path: z.string().nullable(),
  status: z.enum(['draft', 'published', 'archived']),
  published_at: z.string().nullable(),
})

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>

// 特集に紐づける記事ID（配列の順序がそのまま表示順 position になる）
export const collectionPostIdsSchema = z
  .array(z.string())
  .refine((ids) => new Set(ids).size === ids.length, '同じ記事が重複しています')
