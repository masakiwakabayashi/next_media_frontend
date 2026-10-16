import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import AdminQuickLinks from './AdminQuickLinks'

describe('AdminQuickLinks', () => {
  it('各クイックリンクを正しいhrefで表示する', () => {
    render(<AdminQuickLinks />)

    expect(screen.getByRole('link', { name: '記事を作成' })).toHaveAttribute(
      'href',
      '/admin/posts/new'
    )
    expect(screen.getByRole('link', { name: '下書き一覧' })).toHaveAttribute(
      'href',
      '/admin/posts/drafts'
    )
    expect(screen.getByRole('link', { name: '特集を作成' })).toHaveAttribute(
      'href',
      '/admin/collections/new'
    )
    expect(screen.getByRole('link', { name: 'タグ管理' })).toHaveAttribute(
      'href',
      '/admin/tags'
    )
    expect(screen.getByRole('link', { name: 'ユーザー管理' })).toHaveAttribute(
      'href',
      '/admin/users'
    )
  })

  it('リンクは5つ表示される', () => {
    render(<AdminQuickLinks />)

    expect(screen.getAllByRole('link')).toHaveLength(5)
  })
})
