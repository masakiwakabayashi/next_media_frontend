import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SearchForm from './SearchForm'
import { useRouter } from 'next/navigation'

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

const push = vi.fn()

beforeEach(() => {
  push.mockClear()
  vi.mocked(useRouter).mockReturnValue({
    push,
  } as unknown as ReturnType<typeof useRouter>)
})

describe('SearchForm', () => {
  it('defaultValueを入力欄に反映する', () => {
    render(<SearchForm defaultValue="キーワード" />)

    expect(screen.getByPlaceholderText('記事のタイトル・本文を検索')).toHaveValue('キーワード')
  })

  it('検索語を入力して送信すると検索クエリ付きで遷移する', () => {
    render(<SearchForm />)

    fireEvent.change(screen.getByPlaceholderText('記事のタイトル・本文を検索'), {
      target: { value: '検索語' },
    })
    fireEvent.click(screen.getByRole('button', { name: '検索' }))

    expect(push).toHaveBeenCalledWith('/?q=%E6%A4%9C%E7%B4%A2%E8%AA%9E')
  })

  it('空白のみの入力では遷移しない', () => {
    render(<SearchForm />)

    fireEvent.change(screen.getByPlaceholderText('記事のタイトル・本文を検索'), {
      target: { value: '   ' },
    })
    fireEvent.click(screen.getByRole('button', { name: '検索' }))

    expect(push).not.toHaveBeenCalled()
  })
})
