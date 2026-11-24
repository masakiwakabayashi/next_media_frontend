import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import LoginPage from './page'

vi.mock('@/features/auth/components/LoginForm', () => ({
  default: () => <div data-testid="login-form" />,
}))

describe('LoginPage', () => {
  it('LoginFormを表示する', () => {
    render(<LoginPage />)

    expect(screen.getByTestId('login-form')).toBeInTheDocument()
  })
})
