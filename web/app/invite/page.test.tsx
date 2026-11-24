import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import InvitePage from './page'

vi.mock('@/features/auth/components/AcceptInviteForm', () => ({
  default: () => <div data-testid="accept-invite-form" />,
}))

describe('InvitePage', () => {
  it('AcceptInviteFormを表示する', () => {
    render(<InvitePage />)

    expect(screen.getByTestId('accept-invite-form')).toBeInTheDocument()
  })
})
