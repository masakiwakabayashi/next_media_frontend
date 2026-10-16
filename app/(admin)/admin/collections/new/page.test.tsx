import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import NewCollectionPage from './page'
import { getPostOptions } from '@/external/repositories/postRepository.server'
import type { PostOption } from '@/types/post'

vi.mock('@/external/repositories/postRepository.server', () => ({
  getPostOptions: vi.fn(),
}))
vi.mock('@/features/collections/components/CollectionCreate', () => ({
  default: (props: unknown) => (
    <div data-testid="collection-create">{JSON.stringify(props)}</div>
  ),
}))

const postOptions: PostOption[] = [
  { id: 'p1', title: '記事1', slug: 'post-1' },
  { id: 'p2', title: '記事2', slug: 'post-2' },
]

describe('NewCollectionPage', () => {
  it('記事の選択肢をCollectionCreateに渡す', async () => {
    vi.mocked(getPostOptions).mockResolvedValue(postOptions)

    const jsx = await NewCollectionPage()
    render(jsx)

    expect(screen.getByRole('heading', { name: '特集を作成' })).toBeInTheDocument()

    const props = JSON.parse(
      screen.getByTestId('collection-create').textContent ?? '{}'
    )
    expect(props).toEqual({ postOptions })
  })
})
