import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import DraftsPage from './page'

vi.mock('@/features/posts/components/DraftPostList', () => ({
  default: () => <div data-testid="draft-post-list" />,
}))

describe('DraftsPage', () => {
  it('見出しとDraftPostListを表示する', () => {
    render(<DraftsPage />)

    expect(screen.getByRole('heading', { name: '下書き一覧' })).toBeInTheDocument()
    expect(screen.getByTestId('draft-post-list')).toBeInTheDocument()
  })
})
