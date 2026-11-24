import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import CollectionEdit from './CollectionEdit'
import { useRouter } from 'next/navigation'
import {
  updateCollection,
  updateCollectionPosts,
} from '@/external/repositories/collectionRepository.client'
import type { CollectionForEdit } from '@/types/collection'
import type { PostOption } from '@/types/post'

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))
vi.mock('@/external/repositories/collectionRepository.client', () => ({
  updateCollection: vi.fn(),
  updateCollectionPosts: vi.fn(),
}))

const push = vi.fn()
const refresh = vi.fn()
const back = vi.fn()

const collection: CollectionForEdit = {
  id: 'col1',
  title: '元のタイトル',
  slug: 'original-slug',
  description: '元の説明',
  image_path: '/images/original.png',
  status: 'draft',
  published_at: null,
  posts: [
    { id: 'p1', title: '記事1', slug: 'post-1' },
    { id: 'p2', title: '記事2', slug: 'post-2' },
  ],
}

const postOptions: PostOption[] = [
  { id: 'p1', title: '記事1', slug: 'post-1' },
  { id: 'p2', title: '記事2', slug: 'post-2' },
  { id: 'p3', title: '記事3', slug: 'post-3' },
]

beforeEach(() => {
  push.mockClear()
  refresh.mockClear()
  back.mockClear()
  vi.mocked(useRouter).mockReturnValue({
    push,
    refresh,
    back,
  } as unknown as ReturnType<typeof useRouter>)
  vi.mocked(updateCollection).mockReset().mockResolvedValue({ error: null })
  vi.mocked(updateCollectionPosts).mockReset().mockResolvedValue({ error: null })
})

describe('CollectionEdit', () => {
  it('特集の内容を入力欄の初期値に反映する', () => {
    render(<CollectionEdit collection={collection} postOptions={postOptions} />)

    expect(screen.getByLabelText(/タイトル/)).toHaveValue('元のタイトル')
    expect(screen.getByLabelText(/スラッグ/)).toHaveValue('original-slug')
    expect(screen.getByLabelText('説明')).toHaveValue('元の説明')
    expect(screen.getByLabelText(/アイキャッチ画像URL/)).toHaveValue(
      '/images/original.png'
    )
    expect(screen.getByLabelText('下書き')).toBeChecked()
  })

  it('紐づく記事を position 順に表示する', () => {
    render(<CollectionEdit collection={collection} postOptions={postOptions} />)

    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveTextContent('1.記事1')
    expect(items[1]).toHaveTextContent('2.記事2')
  })

  it('追加セレクトには未紐付けの記事だけが並ぶ', () => {
    render(<CollectionEdit collection={collection} postOptions={postOptions} />)

    const select = screen.getByLabelText('追加する記事')
    const optionLabels = within(select)
      .getAllByRole('option')
      .map((o) => o.textContent)
    expect(optionLabels).toEqual(['記事を選択...', '記事3'])
  })

  it('記事を追加・削除・並び替えして送信内容に反映する', async () => {
    render(<CollectionEdit collection={collection} postOptions={postOptions} />)

    // 記事3 を追加 → [p1, p2, p3]
    fireEvent.change(screen.getByLabelText('追加する記事'), {
      target: { value: 'p3' },
    })
    fireEvent.click(screen.getByRole('button', { name: '追加' }))

    // 記事1 を下へ → [p2, p1, p3]
    fireEvent.click(screen.getByRole('button', { name: '記事1を下へ' }))

    // 記事2 を削除 → [p1, p3]
    fireEvent.click(screen.getAllByRole('button', { name: '削除' })[0])

    fireEvent.click(screen.getByRole('button', { name: '保存する' }))

    await waitFor(() => expect(updateCollectionPosts).toHaveBeenCalled())
    expect(updateCollectionPosts).toHaveBeenCalledWith('col1', ['p1', 'p3'])
  })

  it('公開として保存すると特集詳細ページへ遷移する', async () => {
    render(<CollectionEdit collection={collection} postOptions={postOptions} />)

    fireEvent.change(screen.getByLabelText(/タイトル/), {
      target: { value: '新しいタイトル' },
    })
    fireEvent.click(screen.getByLabelText('公開'))
    fireEvent.click(screen.getByRole('button', { name: '保存する' }))

    await waitFor(() => expect(updateCollection).toHaveBeenCalled())

    expect(updateCollection).toHaveBeenCalledWith(
      'col1',
      expect.objectContaining({ title: '新しいタイトル', status: 'published' })
    )
    expect(updateCollectionPosts).toHaveBeenCalledWith('col1', ['p1', 'p2'])
    expect(push).toHaveBeenCalledWith('/collections/original-slug')
    expect(refresh).toHaveBeenCalled()
  })

  it('下書きとして保存すると特集一覧へ遷移する', async () => {
    render(<CollectionEdit collection={collection} postOptions={postOptions} />)

    fireEvent.click(screen.getByRole('button', { name: '保存する' }))

    await waitFor(() => expect(updateCollection).toHaveBeenCalled())
    expect(push).toHaveBeenCalledWith('/collections')
  })

  it('空欄の説明・画像URLはnullとして送信する', async () => {
    render(<CollectionEdit collection={collection} postOptions={postOptions} />)

    fireEvent.change(screen.getByLabelText('説明'), { target: { value: '' } })
    fireEvent.change(screen.getByLabelText(/アイキャッチ画像URL/), {
      target: { value: '' },
    })
    fireEvent.click(screen.getByRole('button', { name: '保存する' }))

    await waitFor(() => expect(updateCollection).toHaveBeenCalled())

    expect(updateCollection).toHaveBeenCalledWith(
      'col1',
      expect.objectContaining({ description: null, image_path: null })
    )
  })

  it('updateCollectionがエラーを返した場合はエラーを表示し記事の更新も遷移もしない', async () => {
    vi.mocked(updateCollection).mockResolvedValue({ error: '更新に失敗しました' })

    render(<CollectionEdit collection={collection} postOptions={postOptions} />)

    fireEvent.click(screen.getByRole('button', { name: '保存する' }))

    await waitFor(() =>
      expect(screen.getByText('更新に失敗しました')).toBeInTheDocument()
    )
    expect(updateCollectionPosts).not.toHaveBeenCalled()
    expect(push).not.toHaveBeenCalled()
  })

  it('updateCollectionPostsがエラーを返した場合はエラーを表示し遷移しない', async () => {
    vi.mocked(updateCollectionPosts).mockResolvedValue({
      error: '記事の更新に失敗しました',
    })

    render(<CollectionEdit collection={collection} postOptions={postOptions} />)

    fireEvent.click(screen.getByRole('button', { name: '保存する' }))

    await waitFor(() =>
      expect(screen.getByText('記事の更新に失敗しました')).toBeInTheDocument()
    )
    expect(push).not.toHaveBeenCalled()
  })

  it('キャンセルボタンを押すと前のページに戻る', () => {
    render(<CollectionEdit collection={collection} postOptions={postOptions} />)

    fireEvent.click(screen.getByRole('button', { name: 'キャンセル' }))

    expect(back).toHaveBeenCalled()
  })
})
