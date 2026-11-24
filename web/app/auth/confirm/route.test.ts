import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const confirmEmailOtp = vi.fn()
vi.mock('@/external/handler/auth/confirmEmailOtp', () => ({
  confirmEmailOtp: (params: unknown) => confirmEmailOtp(params),
}))

import { GET } from './route'

function request(query: string) {
  return new NextRequest(`http://0.0.0.0:8080/auth/confirm${query}`)
}

describe('GET /auth/confirm', () => {
  beforeEach(() => {
    confirmEmailOtp.mockReset()
    confirmEmailOtp.mockResolvedValue({ error: null })
  })

  it('検証に成功したら next へ相対パスでリダイレクトする', async () => {
    const response = await GET(request('?token_hash=h&type=recovery&next=/reset-password'))

    expect(confirmEmailOtp).toHaveBeenCalledWith({ type: 'recovery', token_hash: 'h' })
    expect(response.headers.get('location')).toBe('/reset-password')
  })

  it('recovery の検証に失敗したら /reset-password へリダイレクトする', async () => {
    confirmEmailOtp.mockResolvedValue({ error: 'expired' })

    const response = await GET(request('?token_hash=h&type=recovery&next=/reset-password'))

    expect(response.headers.get('location')).toBe('/reset-password')
  })

  it('invite の検証に失敗したら /invite へリダイレクトする', async () => {
    confirmEmailOtp.mockResolvedValue({ error: 'expired' })

    const response = await GET(request('?token_hash=h&type=invite&next=/invite'))

    expect(response.headers.get('location')).toBe('/invite')
  })

  it('next が外部 URL の場合はトップへリダイレクトする', async () => {
    const response = await GET(request('?token_hash=h&type=invite&next=//evil.example'))

    expect(response.headers.get('location')).toBe('/')
  })
})
