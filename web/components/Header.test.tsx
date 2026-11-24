import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Header from './Header'
import { useAuth } from '@/contexts/AuthProvider'
import { useRouter } from 'next/navigation'

vi.mock('@/contexts/AuthProvider', () => ({
  useAuth: vi.fn(),
}))
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

const refresh = vi.fn()

beforeEach(() => {
  vi.mocked(useRouter).mockReturnValue({
    refresh,
  } as unknown as ReturnType<typeof useRouter>)
})

describe('Header', () => {
  it('サイトタイトルを表示する', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: true,
      isAdmin: false,
      displayName: null,
      signOut: vi.fn(),
    } as unknown as ReturnType<typeof useAuth>)

    render(<Header />)

    expect(screen.getByRole('link', { name: 'Next Media' })).toHaveAttribute('href', '/')
  })

  it('loading中はログイン/ログアウトボタンを表示しない', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: true,
      isAdmin: false,
      displayName: null,
      signOut: vi.fn(),
    } as unknown as ReturnType<typeof useAuth>)

    render(<Header />)

    expect(screen.queryByRole('link', { name: 'ログイン' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'ログアウト' })).not.toBeInTheDocument()
  })

  it('ログイン中は表示名とログアウトボタンを表示する', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { email: 'user@example.com' },
      loading: false,
      isAdmin: false,
      displayName: 'テストユーザー',
      signOut: vi.fn(),
    } as unknown as ReturnType<typeof useAuth>)

    render(<Header />)

    expect(screen.getByRole('link', { name: 'テストユーザー' })).toHaveAttribute(
      'href',
      '/profile/edit'
    )
    expect(screen.getByRole('button', { name: 'ログアウト' })).toBeInTheDocument()
    expect(screen.queryByText('管理者')).not.toBeInTheDocument()
  })

  it('displayNameが無い場合はメールアドレスを表示する', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { email: 'user@example.com' },
      loading: false,
      isAdmin: false,
      displayName: null,
      signOut: vi.fn(),
    } as unknown as ReturnType<typeof useAuth>)

    render(<Header />)

    expect(screen.getByRole('link', { name: 'user@example.com' })).toBeInTheDocument()
  })

  it('管理者の場合は管理者バッジを表示する', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { email: 'admin@example.com' },
      loading: false,
      isAdmin: true,
      displayName: '管理者ユーザー',
      signOut: vi.fn(),
    } as unknown as ReturnType<typeof useAuth>)

    render(<Header />)

    expect(screen.getByText('管理者')).toBeInTheDocument()
  })

  it('ログアウトボタンを押すとsignOutとrouter.refreshが呼ばれる', async () => {
    const signOut = vi.fn().mockResolvedValue(undefined)
    vi.mocked(useAuth).mockReturnValue({
      user: { email: 'user@example.com' },
      loading: false,
      isAdmin: false,
      displayName: null,
      signOut,
    } as unknown as ReturnType<typeof useAuth>)

    render(<Header />)

    fireEvent.click(screen.getByRole('button', { name: 'ログアウト' }))

    expect(signOut).toHaveBeenCalled()
    await waitFor(() => expect(refresh).toHaveBeenCalled())
  })
})
