import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import AdminEditLink from './AdminEditLink'
import { useAuth } from '@/contexts/AuthProvider'

vi.mock('@/contexts/AuthProvider', () => ({
  useAuth: vi.fn(),
}))

describe('AdminEditLink', () => {
  it('管理者でない場合は何も表示しない', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAdmin: false,
    } as ReturnType<typeof useAuth>)

    const { container } = render(<AdminEditLink slug="my-post" />)

    expect(container).toBeEmptyDOMElement()
  })

  it('管理者の場合は編集リンクを表示する', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAdmin: true,
    } as ReturnType<typeof useAuth>)

    render(<AdminEditLink slug="my-post" />)

    expect(screen.getByRole('link', { name: '編集' })).toHaveAttribute(
      'href',
      '/admin/posts/my-post/edit'
    )
  })
})
