import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setUserBannedAction } from './setUserBanned'
import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/server'
import { assertAdmin } from '@/external/handler/auth/assertAdmin'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))
vi.mock('@/lib/supabase/server', () => ({
  supabaseAdmin: {
    auth: { admin: { updateUserById: vi.fn() } },
  },
}))
vi.mock('@/external/handler/auth/assertAdmin', () => ({
  assertAdmin: vi.fn(),
}))

const updateUserById = vi.mocked(supabaseAdmin.auth.admin.updateUserById)

beforeEach(() => {
  vi.mocked(revalidatePath).mockReset()
  updateUserById.mockReset().mockResolvedValue({ data: { user: null }, error: null } as never)
  vi.mocked(assertAdmin).mockReset().mockResolvedValue({ error: null })
})

describe('setUserBannedAction', () => {
  it('管理者の場合はユーザーを利用停止にする', async () => {
    const result = await setUserBannedAction({ userId: 'u1', banned: true })

    expect(result).toEqual({ error: null })
    expect(updateUserById).toHaveBeenCalledWith('u1', { ban_duration: '876000h' })
    expect(revalidatePath).toHaveBeenCalledWith('/admin/users')
  })

  it('管理者の場合は利用停止を解除できる', async () => {
    await setUserBannedAction({ userId: 'u1', banned: false })

    expect(updateUserById).toHaveBeenCalledWith('u1', { ban_duration: 'none' })
  })

  it('管理者でない場合は更新せずに権限エラーを返す', async () => {
    vi.mocked(assertAdmin).mockResolvedValue({ error: 'この操作を行う権限がありません' })

    const result = await setUserBannedAction({ userId: 'u1', banned: true })

    expect(result).toEqual({ error: 'この操作を行う権限がありません' })
    expect(updateUserById).not.toHaveBeenCalled()
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('ユーザーIDが空の場合はバリデーションエラーを返す', async () => {
    const result = await setUserBannedAction({ userId: '', banned: true })

    expect(result).toEqual({ error: 'ユーザーIDが不正です' })
    expect(updateUserById).not.toHaveBeenCalled()
  })

  it('更新に失敗した場合はエラーを返す', async () => {
    updateUserById.mockResolvedValue({ data: { user: null }, error: { message: 'update failed' } } as never)

    const result = await setUserBannedAction({ userId: 'u1', banned: true })

    expect(result).toEqual({ error: 'update failed' })
    expect(revalidatePath).not.toHaveBeenCalled()
  })
})
