import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ForgotPasswordPage from './page'

vi.mock('@/features/auth/components/ForgotPasswordForm', () => ({
  default: () => <div data-testid="forgot-password-form" />,
}))

describe('ForgotPasswordPage', () => {
  it('ForgotPasswordFormを表示する', () => {
    render(<ForgotPasswordPage />)

    expect(screen.getByTestId('forgot-password-form')).toBeInTheDocument()
  })
})
