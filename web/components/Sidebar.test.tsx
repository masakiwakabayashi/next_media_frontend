import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Sidebar from './Sidebar'
import { getCategories } from '@/external/repositories/categoryRepository'
import { getTagOptions } from '@/external/repositories/tagRepository.server'
import { getCollections } from '@/external/repositories/collectionRepository'

vi.mock('@/external/repositories/categoryRepository', () => ({
  getCategories: vi.fn(),
}))
vi.mock('@/external/repositories/tagRepository.server', () => ({
  getTagOptions: vi.fn(),
}))
vi.mock('@/external/repositories/collectionRepository', () => ({
  getCollections: vi.fn(),
}))
vi.mock('@/components/AdminSidebarLinks', () => ({
  default: () => <div data-testid="admin-sidebar-links" />,
}))

describe('Sidebar', () => {
  it('カテゴリー・タグ・特集記事を一覧表示する', async () => {
    vi.mocked(getCategories).mockResolvedValue([
      { id: 'c1', name: 'テック', slug: 'tech' },
    ])
    vi.mocked(getTagOptions).mockResolvedValue([
      { id: 't1', name: 'React', slug: 'react', created_at: '2024-01-01' },
    ])
    vi.mocked(getCollections).mockResolvedValue([
      {
        id: 'col1',
        title: '特集記事タイトル',
        slug: 'feature',
        description: null,
        image_path: null,
        image_url: null,
        published_at: '2024-01-01',
      },
    ])

    const jsx = await Sidebar()
    render(jsx)

    expect(screen.getByTestId('admin-sidebar-links')).toBeInTheDocument()

    expect(screen.getByText('カテゴリー')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'テック' })).toHaveAttribute(
      'href',
      '/categories/tech'
    )

    expect(screen.getByText('タグ')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '#React' })).toHaveAttribute('href', '/tags/react')

    expect(screen.getByText('特集記事')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '特集記事タイトル' })).toHaveAttribute(
      'href',
      '/collections/feature'
    )
  })

  it('データが空の場合はセクションを表示しない', async () => {
    vi.mocked(getCategories).mockResolvedValue([])
    vi.mocked(getTagOptions).mockResolvedValue([])
    vi.mocked(getCollections).mockResolvedValue([])

    const jsx = await Sidebar()
    render(jsx)

    expect(screen.queryByText('カテゴリー')).not.toBeInTheDocument()
    expect(screen.queryByText('タグ')).not.toBeInTheDocument()
    expect(screen.queryByText('特集記事')).not.toBeInTheDocument()
  })
})
