import Link from 'next/link'
import EyecatchImage from '@/components/EyecatchImage'
import type { PostSummary } from '@/types/post'

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function truncateContent(content: string, maxLength: number = 100): string {
  if (content.length <= maxLength) return content
  return content.slice(0, maxLength) + '...'
}

export default function PostCard({ post }: { post: PostSummary }) {
  return (
    <article className="rounded-lg border border-zinc-200 p-6 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700">
      <EyecatchImage src={post.image_path} alt={post.title} />

      <div className="mb-2 flex items-center gap-2 text-sm text-zinc-500">
        {post.category && (
          <span className="rounded bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">
            {post.category.name}
          </span>
        )}
        {post.published_at && (
          <time dateTime={post.published_at}>
            {formatDate(post.published_at)}
          </time>
        )}
      </div>

      <Link href={`/posts/${post.slug}`}>
        <h2 className="mb-2 break-words text-xl font-bold text-zinc-900 hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-300">
          {post.title}
        </h2>
      </Link>

      <p className="mb-3 break-words text-zinc-600 dark:text-zinc-400">
        {truncateContent(post.content)}
      </p>

      {post.post_tags && post.post_tags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1">
          {post.post_tags.map((pt) => (
            <Link
              key={pt.tag.id}
              href={`/tags/${pt.tag.slug}`}
              className="rounded-full border border-zinc-200 px-2 py-0.5 text-xs text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 dark:border-zinc-700 dark:hover:border-zinc-500 dark:hover:text-zinc-300"
            >
              #{pt.tag.name}
            </Link>
          ))}
        </div>
      )}

      {post.author && (
        <div className="text-sm text-zinc-500">{post.author.display_name}</div>
      )}
    </article>
  )
}
