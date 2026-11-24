import { describe, it, expect, vi, beforeEach } from 'vitest'
import { assertAdmin, FORBIDDEN_ERROR } from './assertAdmin'
import { createServerSupabaseClient } from '@/lib/supabase/server'

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(),
}))

const getUser = vi.fn()

beforeEach(() => {
  getUser.mockReset()
  vi.mocked(createServerSupabaseClient).mockReset().mockResolvedValue({
    auth: { getUser },
  } as never)
})

describe('assertAdmin', () => {
  it('管理者の場合はエラーを返さない', async () => {
    getUser.mockResolvedValue({
      data: { user: { id: 'u1', app_metadata: { role: 'admin' } } },
      error: null,
    })

    expect(await assertAdmin()).toEqual({ error: null })
  })

  it('一般ユーザーの場合は権限エラーを返す', async () => {
    getUser.mockResolvedValue({
      data: { user: { id: 'u1', app_metadata: {} } },
      error: null,
    })

    expect(await assertAdmin()).toEqual({ error: FORBIDDEN_ERROR })
  })

  it('未ログインの場合は権限エラーを返す', async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null })

    expect(await assertAdmin()).toEqual({ error: FORBIDDEN_ERROR })
  })

  it('トークンの検証に失敗した場合は権限エラーを返す', async () => {
    getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'invalid JWT' },
    })

    expect(await assertAdmin()).toEqual({ error: FORBIDDEN_ERROR })
  })

  it('user_metadata の role は管理者として扱わない', async () => {
    // user_metadata は本人が updateUser で書き換えられるため、判定に使ってはいけない
    getUser.mockResolvedValue({
      data: { user: { id: 'u1', app_metadata: {}, user_metadata: { role: 'admin' } } },
      error: null,
    })

    expect(await assertAdmin()).toEqual({ error: FORBIDDEN_ERROR })
  })
})
