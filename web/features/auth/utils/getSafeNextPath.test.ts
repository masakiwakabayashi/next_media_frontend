import { describe, it, expect } from 'vitest'
import { getSafeNextPath } from './getSafeNextPath'

describe('getSafeNextPath', () => {
  it.each([
    ['/reset-password', '/reset-password'],
    ['/posts/abc?page=2', '/posts/abc?page=2'],
    ['/', '/'],
  ])('同一オリジン内のパス %s はそのまま返す', (input, expected) => {
    expect(getSafeNextPath(input)).toBe(expected)
  })

  it.each([
    ['null', null],
    ['空文字', ''],
    ['絶対 URL', 'https://evil.example'],
    ['プロトコル相対 URL', '//evil.example'],
    ['バックスラッシュ始まり', '/\\evil.example'],
    ['スラッシュで始まらないパス', 'reset-password'],
  ])('%s の場合は / を返す', (_, input) => {
    expect(getSafeNextPath(input)).toBe('/')
  })
})
