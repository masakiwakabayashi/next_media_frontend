import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CollectionCreate from './CollectionCreate'
import { useRouter } from 'next/navigation'
import { uploadPostImage } from '@/external/repositories/postRepository'
import { createCollectionAction } from '@/external/handler/collection/createCollection'

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))
vi.mock('@/external/repositories/postRepository', () => ({
  uploadPostImage: vi.fn(),
}))
vi.mock('@/external/handler/collection/createCollection', () => ({
  createCollectionAction: vi.fn(),
}))

const push = vi.fn()
const refresh = vi.fn()
const back = vi.fn()

const postOptions = [
  { id: 'p1', title: '記事1', slug: 'post-1' },
  { id: 'p2', title: '記事2', slug: 'post-2' },
]

function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText(/タイトル/), { target: { value: '特集タイトル' } })
  fireEvent.change(screen.getByLabelText(/スラッグ/), { target: { value: 'my-collection' } })
}

function addPost(id: string) {
  fireEvent.change(screen.getByLabelText('追加する記事'), { target: { value: id } })
  fireEvent.click(screen.getByRole('button', { name: '追加' }))
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
  vi.mocked(createCollectionAction)
    .mockReset()
    .mockResolvedValue({ data: { id: 'col1' }, error: null })
  vi.mocked(uploadPostImage).mockReset()
  URL.createObjectURL = vi.fn(() => 'blob:mock')
  URL.revokeObjectURL = vi.fn()
})

describe('CollectionCreate', () => {
  it('入力欄と記事の選択肢を表示する', () => {
    render(<CollectionCreate postOptions={postOptions} />)

    expect(screen.getByLabelText(/タイトル/)).toBeInTheDocument()
    expect(screen.getByLabelText(/スラッグ/)).toBeInTheDocument()
    expect(screen.getByLabelText('説明')).toBeInTheDocument()
    expect(screen.getByLabelText('アイキャッチ画像')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '記事1' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '記事2' })).toBeInTheDocument()
    expect(screen.getByText('紐づく記事はありません')).toBeInTheDocument()
  })

  it('下書きとして保存するとcreateCollectionActionが呼ばれ編集画面へ遷移する', async () => {
    render(<CollectionCreate postOptions={postOptions} />)

    fillRequiredFields()
    fireEvent.change(screen.getByLabelText('説明'), { target: { value: '説明文' } })
    fireEvent.click(screen.getByRole('button', { name: '保存する' }))

    await waitFor(() => expect(createCollectionAction).toHaveBeenCalled())

    expect(createCollectionAction).toHaveBeenCalledWith(
      {
        title: '特集タイトル',
        slug: 'my-collection',
        description: '説明文',
        image_path: null,
        status: 'draft',
        published_at: null,
      },
      []
    )
    expect(push).toHaveBeenCalledWith('/admin/collections/my-collection/edit')
    expect(refresh).toHaveBeenCalled()
  })

  it('説明が空の場合はnullを送信する', async () => {
    render(<CollectionCreate postOptions={postOptions} />)

    fillRequiredFields()
    fireEvent.click(screen.getByRole('button', { name: '保存する' }))

    await waitFor(() => expect(createCollectionAction).toHaveBeenCalled())

    const [data] = vi.mocked(createCollectionAction).mock.calls[0]
    expect((data as { description: string | null }).description).toBeNull()
  })

  it('公開ステータスで保存すると特集ページへ遷移する', async () => {
    render(<CollectionCreate postOptions={postOptions} />)

    fillRequiredFields()
    fireEvent.click(screen.getByLabelText('公開'))
    fireEvent.click(screen.getByRole('button', { name: '保存する' }))

    await waitFor(() => expect(createCollectionAction).toHaveBeenCalled())

    const [data] = vi.mocked(createCollectionAction).mock.calls[0]
    expect((data as { status: string }).status).toBe('published')
    expect((data as { published_at: string | null }).published_at).not.toBeNull()
    expect(push).toHaveBeenCalledWith('/collections/my-collection')
  })

  it('追加した記事は選択肢から除かれ、並べ替えた順序で送信される', async () => {
    render(<CollectionCreate postOptions={postOptions} />)

    fillRequiredFields()
    addPost('p1')
    addPost('p2')

    expect(screen.queryByRole('option', { name: '記事1' })).not.toBeInTheDocument()
    expect(screen.queryByRole('option', { name: '記事2' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '記事2を上へ' }))
    fireEvent.click(screen.getByRole('button', { name: '保存する' }))

    await waitFor(() => expect(createCollectionAction).toHaveBeenCalled())

    const [, postIds] = vi.mocked(createCollectionAction).mock.calls[0]
    expect(postIds).toEqual(['p2', 'p1'])
  })

  it('削除した記事は送信内容に含まれない', async () => {
    render(<CollectionCreate postOptions={postOptions} />)

    fillRequiredFields()
    addPost('p1')
    addPost('p2')
    fireEvent.click(screen.getAllByRole('button', { name: '削除' })[0])
    fireEvent.click(screen.getByRole('button', { name: '保存する' }))

    await waitFor(() => expect(createCollectionAction).toHaveBeenCalled())

    const [, postIds] = vi.mocked(createCollectionAction).mock.calls[0]
    expect(postIds).toEqual(['p2'])
  })

  it('画像を選択した場合はアップロードしたパスを送信する', async () => {
    vi.mocked(uploadPostImage).mockResolvedValue({ path: 'posts/abc.png', error: null })
    render(<CollectionCreate postOptions={postOptions} />)

    fillRequiredFields()
    const file = new File(['x'], 'image.png', { type: 'image/png' })
    fireEvent.change(screen.getByLabelText('アイキャッチ画像'), { target: { files: [file] } })
    fireEvent.click(screen.getByRole('button', { name: '保存する' }))

    await waitFor(() => expect(createCollectionAction).toHaveBeenCalled())

    expect(uploadPostImage).toHaveBeenCalledWith(file)
    const [data] = vi.mocked(createCollectionAction).mock.calls[0]
    expect((data as { image_path: string | null }).image_path).toBe('posts/abc.png')
  })

  it('画像のアップロードに失敗した場合はエラーを表示し作成しない', async () => {
    vi.mocked(uploadPostImage).mockResolvedValue({ path: null, error: 'アップロード失敗' })
    render(<CollectionCreate postOptions={postOptions} />)

    fillRequiredFields()
    const file = new File(['x'], 'image.png', { type: 'image/png' })
    fireEvent.change(screen.getByLabelText('アイキャッチ画像'), { target: { files: [file] } })
    fireEvent.click(screen.getByRole('button', { name: '保存する' }))

    expect(await screen.findByText('アップロード失敗')).toBeInTheDocument()
    expect(createCollectionAction).not.toHaveBeenCalled()
    expect(push).not.toHaveBeenCalled()
  })

  it('作成に失敗した場合はエラーを表示し遷移しない', async () => {
    vi.mocked(createCollectionAction).mockResolvedValue({
      data: null,
      error: 'duplicate key value violates unique constraint',
    })
    render(<CollectionCreate postOptions={postOptions} />)

    fillRequiredFields()
    fireEvent.click(screen.getByRole('button', { name: '保存する' }))

    expect(
      await screen.findByText('duplicate key value violates unique constraint')
    ).toBeInTheDocument()
    expect(push).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: '保存する' })).not.toBeDisabled()
  })

  it('キャンセルを押すとrouter.backが呼ばれる', () => {
    render(<CollectionCreate postOptions={postOptions} />)

    fireEvent.click(screen.getByRole('button', { name: 'キャンセル' }))

    expect(back).toHaveBeenCalled()
  })
})
