import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PostCreate from './PostCreate'
import { useRouter } from 'next/navigation'
import { uploadPostImage } from '@/external/repositories/postRepository'
import { createPostAction } from '@/external/handler/post/createPost'

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))
vi.mock('@/external/repositories/postRepository', () => ({
  uploadPostImage: vi.fn(),
}))
vi.mock('@/external/handler/post/createPost', () => ({
  createPostAction: vi.fn(),
}))

const push = vi.fn()
const refresh = vi.fn()
const back = vi.fn()

const categories = [{ id: 'c1', name: 'ニュース' }]
const authors = [{ id: 'a1', display_name: '山田太郎' }]
const tags = [{ id: 't1', name: 'グルメ' }]

function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText(/タイトル/), { target: { value: 'タイトル' } })
  fireEvent.change(screen.getByLabelText(/スラッグ/), { target: { value: 'my-slug' } })
  fireEvent.change(screen.getByLabelText(/本文/), { target: { value: '本文です' } })
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
  vi.mocked(createPostAction).mockReset().mockResolvedValue({ data: { id: 'p1' }, error: null })
  vi.mocked(uploadPostImage).mockReset()
  URL.createObjectURL = vi.fn(() => 'blob:mock')
  URL.revokeObjectURL = vi.fn()
})

describe('PostCreate', () => {
  it('入力欄と選択肢を表示する', () => {
    render(<PostCreate categories={categories} authors={authors} tags={tags} />)

    expect(screen.getByLabelText(/タイトル/)).toBeInTheDocument()
    expect(screen.getByLabelText(/スラッグ/)).toBeInTheDocument()
    expect(screen.getByLabelText(/本文/)).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'ニュース' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '#グルメ' })).toBeInTheDocument()
  })

  it('下書きとして保存するとcreatePostActionが呼ばれredirectToへ遷移する', async () => {
    render(
      <PostCreate
        categories={categories}
        authors={authors}
        tags={tags}
        redirectTo="/admin/posts/drafts"
      />
    )

    fillRequiredFields()
    fireEvent.click(screen.getByRole('button', { name: '保存する' }))

    await waitFor(() => expect(createPostAction).toHaveBeenCalled())

    expect(createPostAction).toHaveBeenCalledWith(
      {
        title: 'タイトル',
        slug: 'my-slug',
        content: '本文です',
        image_path: null,
        category_id: null,
        author_id: 'a1',
        status: 'draft',
        published_at: null,
      },
      []
    )
    expect(push).toHaveBeenCalledWith('/admin/posts/drafts')
    expect(refresh).toHaveBeenCalled()
  })

  it('公開ステータスで保存すると/へ遷移する', async () => {
    render(<PostCreate categories={categories} authors={authors} tags={tags} />)

    fillRequiredFields()
    fireEvent.click(screen.getByLabelText('公開'))
    fireEvent.click(screen.getByRole('button', { name: '保存する' }))

    await waitFor(() => expect(createPostAction).toHaveBeenCalled())

    const [data] = vi.mocked(createPostAction).mock.calls[0]
    expect((data as { status: string }).status).toBe('published')
    expect((data as { published_at: string | null }).published_at).not.toBeNull()
    expect(push).toHaveBeenCalledWith('/')
  })

  it('カテゴリーを選択すると送信内容に反映される', async () => {
    render(<PostCreate categories={categories} authors={authors} tags={tags} />)

    fillRequiredFields()
    fireEvent.change(screen.getByLabelText('カテゴリー'), { target: { value: 'c1' } })
    fireEvent.click(screen.getByRole('button', { name: '保存する' }))

    await waitFor(() => expect(createPostAction).toHaveBeenCalled())

    const [data] = vi.mocked(createPostAction).mock.calls[0]
    expect((data as { category_id: string | null }).category_id).toBe('c1')
  })

  it('タグをクリックすると選択され送信内容に反映される', async () => {
    render(<PostCreate categories={categories} authors={authors} tags={tags} />)

    fillRequiredFields()
    fireEvent.click(screen.getByRole('button', { name: '#グルメ' }))
    fireEvent.click(screen.getByRole('button', { name: '保存する' }))

    await waitFor(() => expect(createPostAction).toHaveBeenCalled())

    const [, tagIds] = vi.mocked(createPostAction).mock.calls[0]
    expect(tagIds).toEqual(['t1'])
  })

  it('画像のアップロードに失敗した場合はエラーメッセージを表示し送信を中断する', async () => {
    vi.mocked(uploadPostImage).mockResolvedValue({ path: null, error: 'アップロードに失敗しました' })

    render(<PostCreate categories={categories} authors={authors} tags={tags} />)

    fillRequiredFields()
    const file = new File(['dummy'], 'photo.png', { type: 'image/png' })
    fireEvent.change(screen.getByLabelText('アイキャッチ画像'), { target: { files: [file] } })
    fireEvent.click(screen.getByRole('button', { name: '保存する' }))

    await waitFor(() =>
      expect(screen.getByText('アップロードに失敗しました')).toBeInTheDocument()
    )
    expect(createPostAction).not.toHaveBeenCalled()
  })

  it('画像のアップロードに成功した場合はimage_pathを渡して記事を作成する', async () => {
    vi.mocked(uploadPostImage).mockResolvedValue({ path: 'posts/photo.png', error: null })

    render(<PostCreate categories={categories} authors={authors} tags={tags} />)

    fillRequiredFields()
    const file = new File(['dummy'], 'photo.png', { type: 'image/png' })
    fireEvent.change(screen.getByLabelText('アイキャッチ画像'), { target: { files: [file] } })
    fireEvent.click(screen.getByRole('button', { name: '保存する' }))

    await waitFor(() => expect(createPostAction).toHaveBeenCalled())

    const [data] = vi.mocked(createPostAction).mock.calls[0]
    expect((data as { image_path: string | null }).image_path).toBe('posts/photo.png')
  })

  it('キャンセルボタンを押すと前のページに戻る', () => {
    render(<PostCreate categories={categories} authors={authors} tags={tags} />)

    fireEvent.click(screen.getByRole('button', { name: 'キャンセル' }))

    expect(back).toHaveBeenCalled()
  })
})
