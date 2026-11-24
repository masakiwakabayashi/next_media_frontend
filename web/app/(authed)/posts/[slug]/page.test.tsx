import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import PostPage, { generateMetadata } from './page'
import { getPostMetaBySlug } from '@/external/repositories/postRepository.server'
import type { PostMeta } from '@/types/post'
import { notFound } from 'next/navigation'

vi.mock('@/external/repositories/postRepository.server', () => ({
  getPostMetaBySlug: vi.fn(),
}))
vi.mock('@/features/posts/components/PostDetail', () => ({
  default: ({ slug }: { slug: string }) => <div data-testid="post-detail">{slug}</div>,
}))
vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND')
  }),
}))

const post: PostMeta = {
  title: 'タイトル',
  content: '本文'.repeat(100),
  image_path: '/images/eyecatch.png',
}

describe('PostPage', () => {
  it('記事が存在する場合はPostDetailにslugを渡す', async () => {
    vi.mocked(getPostMetaBySlug).mockResolvedValue(post)

    const jsx = await PostPage({ params: Promise.resolve({ slug: 'my-slug' }) })
    render(jsx)

    expect(getPostMetaBySlug).toHaveBeenCalledWith('my-slug')
    expect(screen.getByTestId('post-detail')).toHaveTextContent('my-slug')
  })

  it('記事が存在しない場合はnotFoundを呼ぶ', async () => {
    vi.mocked(getPostMetaBySlug).mockResolvedValue(null)

    await expect(
      PostPage({ params: Promise.resolve({ slug: 'missing' }) })
    ).rejects.toThrow('NEXT_NOT_FOUND')
    expect(notFound).toHaveBeenCalled()
  })
})

describe('generateMetadata', () => {
  it('記事が存在する場合はタイトルと説明文を返す', async () => {
    vi.mocked(getPostMetaBySlug).mockResolvedValue(post)

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'my-slug' }) })

    expect(metadata.title).toBe('タイトル')
    expect(metadata.description).toBe(post.content.slice(0, 160))
    expect(metadata.openGraph?.images).toEqual(['/images/eyecatch.png'])
  })

  it('記事が存在しない場合は見つからない旨のタイトルを返す', async () => {
    vi.mocked(getPostMetaBySlug).mockResolvedValue(null)

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'missing' }) })

    expect(metadata.title).toBe('記事が見つかりません')
  })
})
