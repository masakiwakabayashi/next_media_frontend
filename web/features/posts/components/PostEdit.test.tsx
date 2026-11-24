import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PostEdit from './PostEdit'
import { useRouter } from 'next/navigation'
import { updatePost, updatePostTags } from '@/external/repositories/postRepository'
import type { PostForEdit } from '@/types/post'

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))
vi.mock('@/external/repositories/postRepository', () => ({
  updatePost: vi.fn(),
  updatePostTags: vi.fn(),
}))

const push = vi.fn()
const refresh = vi.fn()
const back = vi.fn()

const categories = [{ id: 'c1', name: 'ニュース' }]
const tags = [
  { id: 't1', name: 'グルメ' },
  { id: 't2', name: 'カフェ' },
]

const post: PostForEdit = {
  id: 'p1',
  title: '元のタイトル',
  slug: 'original-slug',
  image_path: '/images/original.png',
  content: '元の本文',
  status: 'draft',
  published_at: null,
  category_id: 'c1',
  author_id: 'a1',
  post_tags: [{ tag: { id: 't1', name: 'グルメ', slug: 'gourmet' } }],
}

beforeEach(() => {
  push.mockClear()
  refresh.mockClear()
  back.mockClear()
  vi.mocked(useRouter).mockReturnValue({
    push,
    refresh,
    back,
  } as unknown as ReturnType<typeof useRouter>)
  vi.mocked(updatePost).mockReset().mockResolvedValue({ error: null })
  vi.mocked(updatePostTags).mockReset().mockResolvedValue({ error: null })
})

describe('PostEdit', () => {
  it('記事の内容を入力欄の初期値に反映する', () => {
    render(<PostEdit post={post} categories={categories} tags={tags} />)

    expect(screen.getByLabelText(/タイトル/)).toHaveValue('元のタイトル')
    expect(screen.getByLabelText(/スラッグ/)).toHaveValue('original-slug')
    expect(screen.getByLabelText(/本文/)).toHaveValue('元の本文')
    expect(screen.getByLabelText('カテゴリー')).toHaveValue('c1')
    expect(screen.getByLabelText(/アイキャッチ画像URL/)).toHaveValue('/images/original.png')
    expect(screen.getByLabelText('下書き')).toBeChecked()
    expect(screen.getByRole('button', { name: '#グルメ' })).toHaveClass('bg-zinc-900')
    expect(screen.getByRole('button', { name: '#カフェ' })).not.toHaveClass('bg-zinc-900')
  })

  it('公開記事として保存すると記事詳細ページへ遷移する', async () => {
    render(<PostEdit post={post} categories={categories} tags={tags} />)

    fireEvent.change(screen.getByLabelText(/タイトル/), { target: { value: '新しいタイトル' } })
    fireEvent.click(screen.getByLabelText('公開'))
    fireEvent.click(screen.getByRole('button', { name: '保存する' }))

    await waitFor(() => expect(updatePost).toHaveBeenCalled())

    expect(updatePost).toHaveBeenCalledWith(
      'p1',
      expect.objectContaining({ title: '新しいタイトル', status: 'published' })
    )
    expect(updatePostTags).toHaveBeenCalledWith('p1', ['t1'])
    expect(push).toHaveBeenCalledWith('/posts/original-slug')
    expect(refresh).toHaveBeenCalled()
  })

  it('下書きとして保存すると下書き一覧へ遷移する', async () => {
    render(<PostEdit post={post} categories={categories} tags={tags} />)

    fireEvent.click(screen.getByRole('button', { name: '保存する' }))

    await waitFor(() => expect(updatePost).toHaveBeenCalled())

    expect(push).toHaveBeenCalledWith('/admin/posts/drafts')
  })

  it('非公開として保存できる', async () => {
    render(<PostEdit post={post} categories={categories} tags={tags} />)

    fireEvent.click(screen.getByLabelText('非公開'))
    fireEvent.click(screen.getByRole('button', { name: '保存する' }))

    await waitFor(() => expect(updatePost).toHaveBeenCalled())

    expect(updatePost).toHaveBeenCalledWith(
      'p1',
      expect.objectContaining({ status: 'archived', published_at: null })
    )
  })

  it('タグの選択を切り替えて送信内容に反映する', async () => {
    render(<PostEdit post={post} categories={categories} tags={tags} />)

    fireEvent.click(screen.getByRole('button', { name: '#カフェ' }))
    fireEvent.click(screen.getByRole('button', { name: '#グルメ' }))
    fireEvent.click(screen.getByRole('button', { name: '保存する' }))

    await waitFor(() => expect(updatePostTags).toHaveBeenCalled())

    expect(updatePostTags).toHaveBeenCalledWith('p1', ['t2'])
  })

  it('updatePostがエラーを返した場合はエラーメッセージを表示しタグは更新しない', async () => {
    vi.mocked(updatePost).mockResolvedValue({ error: '更新に失敗しました' })

    render(<PostEdit post={post} categories={categories} tags={tags} />)

    fireEvent.click(screen.getByRole('button', { name: '保存する' }))

    await waitFor(() => expect(screen.getByText('更新に失敗しました')).toBeInTheDocument())
    expect(updatePostTags).not.toHaveBeenCalled()
    expect(push).not.toHaveBeenCalled()
  })

  it('updatePostTagsがエラーを返した場合はエラーメッセージを表示する', async () => {
    vi.mocked(updatePostTags).mockResolvedValue({ error: 'タグの更新に失敗しました' })

    render(<PostEdit post={post} categories={categories} tags={tags} />)

    fireEvent.click(screen.getByRole('button', { name: '保存する' }))

    await waitFor(() =>
      expect(screen.getByText('タグの更新に失敗しました')).toBeInTheDocument()
    )
    expect(push).not.toHaveBeenCalled()
  })

  it('キャンセルボタンを押すと前のページに戻る', () => {
    render(<PostEdit post={post} categories={categories} tags={tags} />)

    fireEvent.click(screen.getByRole('button', { name: 'キャンセル' }))

    expect(back).toHaveBeenCalled()
  })
})
