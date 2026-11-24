import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import CollectionsPage from './page'

vi.mock('@/features/collections/components/CollectionList', () => ({
  default: () => <div data-testid="collection-list" />,
}))

describe('CollectionsPage', () => {
  it('CollectionListを表示する', async () => {
    const jsx = await CollectionsPage()
    render(jsx)

    expect(screen.getByTestId('collection-list')).toBeInTheDocument()
  })
})
