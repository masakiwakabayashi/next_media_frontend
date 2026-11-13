import { describe, it, expect } from 'vitest'
import { validateNewPassword } from './validateNewPassword'

describe('validateNewPassword', () => {
  it('8文字未満ならエラーを返す', () => {
    expect(validateNewPassword('1234567', '1234567')).toBe('パスワードは8文字以上で入力してください')
  })

  it('確認用と一致しなければエラーを返す', () => {
    expect(validateNewPassword('password1', 'password2')).toBe('パスワードが一致しません')
  })

  it('問題なければnullを返す', () => {
    expect(validateNewPassword('password1', 'password1')).toBeNull()
  })
})
