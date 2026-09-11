import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import AdminUsersPage from './page'
import { getUserProfiles } from '@/external/repositories/profileRepository.server'
import type { UserProfile } from '@/types/profile'
import { getAuthUserStatuses } from '@/external/repositories/authAdminRepository'

vi.mock('@/external/repositories/profileRepository.server', () => ({
  getUserProfiles: vi.fn(),
}))
vi.mock('@/external/repositories/authAdminRepository', () => ({
  getAuthUserStatuses: vi.fn(),
}))
vi.mock('@/features/users/components/InviteUserForm', () => ({
  default: () => <div data-testid="invite-user-form" />,
}))
vi.mock('@/features/users/components/UserManager', () => ({
  default: ({ initialUsers }: { initialUsers: unknown }) => (
    <div data-testid="user-manager">{JSON.stringify(initialUsers)}</div>
  ),
}))

const profiles: UserProfile[] = [
  {
    id: 'p1',
    user_id: 'u1',
    display_name: 'Alice',
    bio: null,
    avatar_url: null,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  },
  {
    id: 'p2',
    user_id: null,
    display_name: 'Bob',
    bio: null,
    avatar_url: null,
    created_at: '2026-01-02',
    updated_at: '2026-01-02',
  },
]

describe('AdminUsersPage', () => {
  it('プロフィールと認証情報をマージしてUserManagerに渡す', async () => {
    vi.mocked(getUserProfiles).mockResolvedValue(profiles)
    vi.mocked(getAuthUserStatuses).mockResolvedValue(
      new Map([['u1', { email: 'alice@example.com', banned: true, isAdmin: true }]])
    )

    const jsx = await AdminUsersPage()
    render(jsx)

    expect(screen.getByRole('heading', { name: 'ユーザー管理' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '← ダッシュボードへ' })).toHaveAttribute(
      'href',
      '/admin'
    )
    expect(screen.getByTestId('invite-user-form')).toBeInTheDocument()

    const users = JSON.parse(screen.getByTestId('user-manager').textContent ?? '[]')
    expect(users).toEqual([
      { ...profiles[0], email: 'alice@example.com', banned: true, isAdmin: true },
      { ...profiles[1], banned: false, isAdmin: false },
    ])
  })

  it('認証情報が存在しないユーザーはbanned/isAdminがfalseになる', async () => {
    vi.mocked(getUserProfiles).mockResolvedValue(profiles)
    vi.mocked(getAuthUserStatuses).mockResolvedValue(new Map())

    const jsx = await AdminUsersPage()
    render(jsx)

    const users = JSON.parse(screen.getByTestId('user-manager').textContent ?? '[]')
    expect(users.every((u: { banned: boolean; isAdmin: boolean }) => !u.banned && !u.isAdmin)).toBe(
      true
    )
  })
})
