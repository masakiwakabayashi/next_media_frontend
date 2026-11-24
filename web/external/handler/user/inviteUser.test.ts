import { describe, it, expect, vi, beforeEach } from 'vitest'
import { inviteUserAction } from './inviteUser'
import { revalidatePath } from 'next/cache'
import { inviteUser } from '@/external/repositories/authAdminRepository'
import { assertAdmin } from '@/external/handler/auth/assertAdmin'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))
vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(
    new Headers({ host: 'example.com', 'x-forwarded-proto': 'https' })
  ),
}))
vi.mock('@/external/repositories/authAdminRepository', () => ({
  inviteUser: vi.fn(),
}))
vi.mock('@/external/handler/auth/assertAdmin', () => ({
  assertAdmin: vi.fn(),
}))

const validInput = { email: 'new@example.com', displayName: '新規ユーザー' }

beforeEach(() => {
  vi.mocked(revalidatePath).mockReset()
  vi.mocked(inviteUser).mockReset().mockResolvedValue({ error: null })
  vi.mocked(assertAdmin).mockReset().mockResolvedValue({ error: null })
})

describe('inviteUserAction', () => {
  it('管理者の場合はユーザーを招待する', async () => {
    const result = await inviteUserAction(validInput)

    expect(result).toEqual({ error: null })
    expect(inviteUser).toHaveBeenCalledWith(
      'new@example.com',
      '新規ユーザー',
      'https://example.com/auth/confirm?next=/invite'
    )
    expect(revalidatePath).toHaveBeenCalledWith('/admin/users')
  })

  it('管理者でない場合は招待せずに権限エラーを返す', async () => {
    vi.mocked(assertAdmin).mockResolvedValue({ error: 'この操作を行う権限がありません' })

    const result = await inviteUserAction(validInput)

    expect(result).toEqual({ error: 'この操作を行う権限がありません' })
    expect(inviteUser).not.toHaveBeenCalled()
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('管理者でない場合は入力が不正でも権限エラーを優先する', async () => {
    vi.mocked(assertAdmin).mockResolvedValue({ error: 'この操作を行う権限がありません' })

    const result = await inviteUserAction({ email: '' })

    expect(result).toEqual({ error: 'この操作を行う権限がありません' })
  })

  it('メールアドレスの形式が不正な場合はバリデーションエラーを返す', async () => {
    const result = await inviteUserAction({ ...validInput, email: 'invalid' })

    expect(result).toEqual({ error: 'メールアドレスの形式が不正です' })
    expect(inviteUser).not.toHaveBeenCalled()
  })

  it('招待に失敗した場合はエラーを返す', async () => {
    vi.mocked(inviteUser).mockResolvedValue({ error: 'invite failed' })

    const result = await inviteUserAction(validInput)

    expect(result).toEqual({ error: 'invite failed' })
    expect(revalidatePath).not.toHaveBeenCalled()
  })
})
