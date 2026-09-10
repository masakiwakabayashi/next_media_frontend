'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { updatePost, updatePostTags } from '../../../external/repositories/postRepository'
import type { PostForEdit } from '@/external/repositories/postRepository.types'
import type { Category } from '@/external/repositories/categoryRepository.types'
import type { Tag } from '@/external/repositories/tagRepository.types'

type Props = {
  post: PostForEdit
  categories: Pick<Category, 'id' | 'name'>[]
  tags: Pick<Tag, 'id' | 'name'>[]
}

export default function PostEdit({ post, categories, tags }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState(post.title)
  const [slug, setSlug] = useState(post.slug)
  const [content, setContent] = useState(post.content)
  const [imagePath, setImagePath] = useState(post.image_path ?? '')
  const [categoryId, setCategoryId] = useState(post.category_id ?? '')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    post.post_tags.map((pt) => pt.tag.id)
  )
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>(post.status)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleTagToggle(tagId: string) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const { error: postError } = await updatePost(post.id, {
      title,
      slug,
      content,
      image_path: imagePath || null,
      category_id: categoryId || null,
      status,
      published_at:
        status === 'published'
          ? post.published_at ?? new Date().toISOString()
          : null,
    })

    if (postError) {
      setError(postError)
      setIsSubmitting(false)
      return
    }

    const { error: tagError } = await updatePostTags(post.id, selectedTagIds)

    if (tagError) {
      setError(tagError)
      setIsSubmitting(false)
      return
    }

    router.push(status === 'published' ? `/posts/${slug}` : '/admin/posts/drafts')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      {/* タイトル */}
      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          タイトル <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>

      {/* スラッグ */}
      <div>
        <label htmlFor="slug" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          スラッグ <span className="text-red-500">*</span>
        </label>
        <input
          id="slug"
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>

      {/* カテゴリ */}
      <div>
        <label htmlFor="category" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          カテゴリー
        </label>
        <select
          id="category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        >
          <option value="">なし</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* アイキャッチ画像 */}
      <div>
        <label htmlFor="imagePath" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          アイキャッチ画像URL
        </label>
        <input
          id="imagePath"
          type="text"
          value={imagePath}
          onChange={(e) => setImagePath(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>

      {/* 本文 */}
      <div>
        <label htmlFor="content" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          本文 <span className="text-red-500">*</span>
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={12}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>

      {/* タグ */}
      {tags.length > 0 && (
        <div>
          <span className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            タグ
          </span>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleTagToggle(tag.id)}
                className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                  selectedTagIds.includes(tag.id)
                    ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                    : 'border-zinc-300 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500'
                }`}
              >
                #{tag.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ステータス */}
      <div>
        <span className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          ステータス
        </span>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="radio"
              name="status"
              value="draft"
              checked={status === 'draft'}
              onChange={() => setStatus('draft')}
              className="accent-zinc-900 dark:accent-zinc-100"
            />
            下書き
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="radio"
              name="status"
              value="published"
              checked={status === 'published'}
              onChange={() => setStatus('published')}
              className="accent-zinc-900 dark:accent-zinc-100"
            />
            公開
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="radio"
              name="status"
              value="archived"
              checked={status === 'archived'}
              onChange={() => setStatus('archived')}
              className="accent-zinc-900 dark:accent-zinc-100"
            />
            非公開
          </label>
        </div>
      </div>

      {/* 送信ボタン */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-zinc-900 px-6 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {isSubmitting ? '保存中...' : '保存する'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-zinc-300 px-6 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          キャンセル
        </button>
      </div>
    </form>
  )
}
