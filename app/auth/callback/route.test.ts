import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const exchangeAuthCode = vi.fn()
vi.mock('@/external/handler/auth/exchangeAuthCode', () => ({
  exchangeAuthCode: (code: string) => exchangeAuthCode(code),
}))

import { GET } from './route'

function request(query: string) {
  return new NextRequest(`https://example.com/auth/callback${query}`)
}

describe('GET /auth/callback', () => {
  beforeEach(() => {
    exchangeAuthCode.mockReset()
    exchangeAuthCode.mockResolvedValue({ error: null })
  })

  it('code をセッションに交換して next へリダイレクトする', async () => {
    const response = await GET(request('?code=abc&next=/reset-password'))

    expect(exchangeAuthCode).toHaveBeenCalledWith('abc')
    expect(response.headers.get('location')).toBe('https://example.com/reset-password')
  })

  it('交換に失敗しても next へリダイレクトする', async () => {
    exchangeAuthCode.mockResolvedValue({ error: 'invalid' })

    const response = await GET(request('?code=abc&next=/reset-password'))

    expect(response.headers.get('location')).toBe('https://example.com/reset-password')
  })

  it('code が無い場合は交換せずに next へリダイレクトする', async () => {
    const response = await GET(request('?next=/reset-password'))

    expect(exchangeAuthCode).not.toHaveBeenCalled()
    expect(response.headers.get('location')).toBe('https://example.com/reset-password')
  })

  it.each([
    ['next 未指定', '?code=abc'],
    ['外部 URL', '?code=abc&next=https://evil.example'],
    ['プロトコル相対 URL', '?code=abc&next=//evil.example'],
  ])('%s の場合はトップへリダイレクトする', async (_, query) => {
    const response = await GET(request(query))

    expect(response.headers.get('location')).toBe('https://example.com/')
  })
})
