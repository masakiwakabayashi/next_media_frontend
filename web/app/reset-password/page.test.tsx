import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ResetPasswordPage from './page'

vi.mock('@/features/auth/components/ResetPasswordForm', () => ({
  default: () => <div data-testid="reset-password-form" />,
}))

describe('ResetPasswordPage', () => {
  it('ResetPasswordFormを表示する', () => {
    render(<ResetPasswordPage />)

    expect(screen.getByTestId('reset-password-form')).toBeInTheDocument()
  })
})
