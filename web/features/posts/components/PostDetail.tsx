import Image from 'next/image'
import Link from 'next/link'
import EyecatchImage from '@/components/EyecatchImage'
import AdminEditLink from './AdminEditLink'
import { getPost } from '../../../external/repositories/postRepository.server'

type Props = {
  slug: string
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function PostDetail({ slug }: Props) {
  const post = await getPost(slug)

  if (!post) {
    return (
      <div className="py-8 text-center text-zinc-500">
        記事が見つかりませんでした
      </div>
    )
  }

  const tags = post.post_tags?.map((pt) => pt.tag) || []

  return (
    <article className="mx-auto max-w-3xl">
      {/* アイキャッチ画像 */}
      <EyecatchImage src={post.image_url} alt={post.title} />

      {/* カテゴリ・日付 */}
      <div className="mb-4 flex items-center gap-3 text-sm text-zinc-500">
        {post.category && (
          <Link
            href={`/categories/${post.category.slug}`}
            className="rounded bg-zinc-100 px-2 py-0.5 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
          >
            {post.category.name}
          </Link>
        )}
        {post.published_at && (
          <time dateTime={post.published_at}>
            {formatDate(post.published_at)}
          </time>
        )}
      </div>

      {/* タイトル */}
      <h1 className="mb-6 break-words text-3xl font-bold text-zinc-900 dark:text-zinc-100">
        {post.title}
      </h1>

      {/* タグ */}
      {tags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tags/${tag.slug}`}
              className="rounded-full border border-zinc-300 px-3 py-1 text-sm text-zinc-600 hover:border-zinc-400 hover:text-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-300"
            >
              #{tag.name}
            </Link>
          ))}
        </div>
      )}

      {/* 本文 */}
      <div className="prose prose-zinc max-w-none dark:prose-invert">
        {post.content.split('\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      {/* Googleマップ */}
      {post.google_maps_url && (
        <div className="mt-6">
          <a
            href={post.google_maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline dark:text-blue-400"
          >
            Googleマップで見る
          </a>
        </div>
      )}

      {/* 編集リンク（管理者のみ） */}
      <div className="mt-6">
        <AdminEditLink slug={post.slug} />
      </div>

      {/* 著者情報 */}
      {post.author && (
        <div className="mt-8 border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <div className="flex items-center gap-4">
            {post.author.avatar_url ? (
              <Image
                src={post.author.avatar_url}
                alt={post.author.display_name}
                width={48}
                height={48}
                className="rounded-full"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                {post.author.display_name.charAt(0)}
              </div>
            )}
            <div>
              <div className="font-medium text-zinc-900 dark:text-zinc-100">
                {post.author.display_name}
              </div>
              {post.author.bio && (
                <div className="text-sm text-zinc-500">{post.author.bio}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 戻るリンク */}
      <div className="mt-8">
        <Link
          href="/"
          className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          &larr; 記事一覧に戻る
        </Link>
      </div>
    </article>
  )
}
