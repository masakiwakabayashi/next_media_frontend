import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PostDetail from '@/features/posts/components/PostDetail'
import { getPostMetaBySlug } from '@/external/repositories/postRepository.server'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostMetaBySlug(slug)

  if (!post) {
    return {
      title: '記事が見つかりません',
    }
  }

  return {
    title: post.title,
    description: post.content.slice(0, 160),
    openGraph: {
      title: post.title,
      description: post.content.slice(0, 160),
      images: post.image_path ? [post.image_path] : undefined,
    },
  }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPostMetaBySlug(slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="flex min-h-screen items-start justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <PostDetail slug={slug} />
      </main>
    </div>
  )
}
