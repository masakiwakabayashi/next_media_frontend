import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import CollectionPage from './page'

vi.mock('@/features/collections/components/CollectionDetail', () => ({
  default: ({ collectionSlug }: { collectionSlug: string }) => (
    <div data-testid="collection-detail">{collectionSlug}</div>
  ),
}))

describe('CollectionPage', () => {
  it('paramsのslugをCollectionDetailにcollectionSlugとして渡す', async () => {
    const jsx = await CollectionPage({ params: Promise.resolve({ slug: 'my-collection' }) })
    render(jsx)

    expect(screen.getByTestId('collection-detail')).toHaveTextContent('my-collection')
  })
})
