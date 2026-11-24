import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import AdminSidebarLinks from './AdminSidebarLinks'
import { useAuth } from '@/contexts/AuthProvider'

vi.mock('@/contexts/AuthProvider', () => ({
  useAuth: vi.fn(),
}))

describe('AdminSidebarLinks', () => {
  it('loading中は何も表示しない', () => {
    vi.mocked(useAuth).mockReturnValue({
      loading: true,
      isAdmin: false,
    } as ReturnType<typeof useAuth>)

    const { container } = render(<AdminSidebarLinks />)

    expect(container).toBeEmptyDOMElement()
  })

  it('管理者でない場合は何も表示しない', () => {
    vi.mocked(useAuth).mockReturnValue({
      loading: false,
      isAdmin: false,
    } as ReturnType<typeof useAuth>)

    const { container } = render(<AdminSidebarLinks />)

    expect(container).toBeEmptyDOMElement()
  })

  it('管理者の場合は管理者向けリンクを表示する', () => {
    vi.mocked(useAuth).mockReturnValue({
      loading: false,
      isAdmin: true,
    } as ReturnType<typeof useAuth>)

    render(<AdminSidebarLinks />)

    expect(screen.getByRole('link', { name: '管理者ダッシュボード' })).toHaveAttribute(
      'href',
      '/admin'
    )
    expect(screen.getByRole('link', { name: '記事を作成' })).toHaveAttribute(
      'href',
      '/admin/posts/new'
    )
    expect(screen.getByRole('link', { name: '下書き一覧' })).toHaveAttribute(
      'href',
      '/admin/posts/drafts'
    )
    expect(screen.getByRole('link', { name: '特集を作成' })).toHaveAttribute(
      'href',
      '/admin/collections/new'
    )
    expect(screen.getByRole('link', { name: 'タグ管理' })).toHaveAttribute(
      'href',
      '/admin/tags'
    )
    expect(screen.getByRole('link', { name: 'ユーザー管理' })).toHaveAttribute(
      'href',
      '/admin/users'
    )
  })
})
