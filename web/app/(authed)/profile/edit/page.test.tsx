import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProfileEditPage from './page'

vi.mock('@/features/users/components/ProfileEditor', () => ({
  default: () => <div data-testid="profile-editor" />,
}))

describe('ProfileEditPage', () => {
  it('見出しとProfileEditorを表示する', () => {
    render(<ProfileEditPage />)

    expect(screen.getByRole('heading', { name: 'プロフィール設定' })).toBeInTheDocument()
    expect(screen.getByTestId('profile-editor')).toBeInTheDocument()
  })
})
