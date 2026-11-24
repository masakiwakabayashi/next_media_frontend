export const MIN_PASSWORD_LENGTH = 8

/**
 * 新しいパスワードの入力値を検証する。問題があればエラーメッセージを返す。
 */
export function validateNewPassword(password: string, confirmPassword: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `パスワードは${MIN_PASSWORD_LENGTH}文字以上で入力してください`
  }

  if (password !== confirmPassword) {
    return 'パスワードが一致しません'
  }

  return null
}
