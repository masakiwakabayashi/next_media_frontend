import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createCollectionAction } from './createCollection'
import { revalidatePath } from 'next/cache'
import {
  createCollection,
  attachPostsToCollection,
} from '@/external/repositories/collectionRepository'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))
vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn().mockResolvedValue({}),
}))
vi.mock('@/external/repositories/collectionRepository', () => ({
  createCollection: vi.fn(),
  attachPostsToCollection: vi.fn(),
}))

const validData = {
  title: '特集タイトル',
  slug: 'my-collection',
  description: null,
  image_path: null,
  status: 'draft',
  published_at: null,
}

beforeEach(() => {
  vi.mocked(revalidatePath).mockReset()
  vi.mocked(createCollection).mockReset().mockResolvedValue({ data: { id: 'col1' }, error: null })
  vi.mocked(attachPostsToCollection).mockReset().mockResolvedValue({ error: null })
})

describe('createCollectionAction', () => {
  it('特集を作成し、記事を渡された順序で紐づける', async () => {
    const result = await createCollectionAction(validData, ['p2', 'p1'])

    expect(result).toEqual({ data: { id: 'col1' }, error: null })
    expect(createCollection).toHaveBeenCalledWith(expect.anything(), validData)
    expect(attachPostsToCollection).toHaveBeenCalledWith(expect.anything(), 'col1', ['p2', 'p1'])
    expect(revalidatePath).toHaveBeenCalledWith('/collections')
  })

  it('記事が空の場合は紐づけを行わない', async () => {
    const result = await createCollectionAction(validData, [])

    expect(result.error).toBeNull()
    expect(attachPostsToCollection).not.toHaveBeenCalled()
  })

  it('タイトルが空の場合はバリデーションエラーを返す', async () => {
    const result = await createCollectionAction({ ...validData, title: '' }, [])

    expect(result).toEqual({ data: null, error: 'タイトルを入力してください' })
    expect(createCollection).not.toHaveBeenCalled()
  })

  it('スラッグが空の場合はバリデーションエラーを返す', async () => {
    const result = await createCollectionAction({ ...validData, slug: '' }, [])

    expect(result).toEqual({ data: null, error: 'スラッグを入力してください' })
  })

  it('記事IDが重複している場合はエラーを返す', async () => {
    const result = await createCollectionAction(validData, ['p1', 'p1'])

    expect(result).toEqual({ data: null, error: '記事の指定が不正です' })
    expect(createCollection).not.toHaveBeenCalled()
  })

  it('特集の作成に失敗した場合はエラーを返す', async () => {
    vi.mocked(createCollection).mockResolvedValue({ data: null, error: 'insert failed' })

    const result = await createCollectionAction(validData, ['p1'])

    expect(result).toEqual({ data: null, error: 'insert failed' })
    expect(attachPostsToCollection).not.toHaveBeenCalled()
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('記事の紐づけに失敗した場合はエラーを返す', async () => {
    vi.mocked(attachPostsToCollection).mockResolvedValue({ error: 'attach failed' })

    const result = await createCollectionAction(validData, ['p1'])

    expect(result).toEqual({ data: null, error: 'attach failed' })
  })
})
