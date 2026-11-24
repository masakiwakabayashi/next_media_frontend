import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import LoadingSpinner from './LoadingSpinner'

describe('LoadingSpinner', () => {
  it('messageが指定されていない場合はメッセージを表示しない', () => {
    const { container } = render(<LoadingSpinner />)

    expect(container.querySelector('p')).not.toBeInTheDocument()
  })

  it('messageが指定されている場合はメッセージを表示する', () => {
    render(<LoadingSpinner message="読み込み中..." />)

    expect(screen.getByText('読み込み中...')).toBeInTheDocument()
  })
})
