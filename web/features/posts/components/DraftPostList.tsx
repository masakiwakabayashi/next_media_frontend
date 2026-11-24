import Link from 'next/link'
import EyecatchImage from '@/components/EyecatchImage'
import { getDraftPosts } from '../../../external/repositories/postRepository.server'

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

export default async function DraftPostList() {
  const posts = await getDraftPosts()

  if (posts.length === 0) {
    return (
      <div className="py-8 text-center text-zinc-500">
        下書きがありません
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <article
          key={post.id}
          className="rounded-lg border border-zinc-200 p-6 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700"
        >
          <EyecatchImage src={post.image_url} alt={post.title} />

          <div className="mb-2 flex items-center gap-2 text-sm text-zinc-500">
            <span className="rounded bg-amber-100 px-2 py-0.5 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              下書き
            </span>
            {post.category && (
              <span className="rounded bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">
                {post.category.name}
              </span>
            )}
            <time dateTime={post.created_at}>
              {formatDate(post.created_at)}
            </time>
          </div>

          <h2 className="mb-2 break-words text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {post.title}
          </h2>

          <p className="mb-3 break-words text-zinc-600 dark:text-zinc-400">
            {truncateContent(post.content)}
          </p>

          {post.post_tags && post.post_tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1">
              {post.post_tags.map((pt) => (
                <span
                  key={pt.tag.id}
                  className="rounded-full border border-zinc-200 px-2 py-0.5 text-xs text-zinc-500 dark:border-zinc-700"
                >
                  #{pt.tag.name}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            {post.author && (
              <div className="text-sm text-zinc-500">
                {post.author.display_name}
              </div>
            )}
            <Link
              href={`/admin/posts/drafts/${post.slug}/edit`}
              className="rounded-lg border border-zinc-300 px-3 py-1 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              編集
            </Link>
          </div>
        </article>
      ))}
    </div>
  )
}
