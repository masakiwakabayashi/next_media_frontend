'use client'

import { useEffect, useState, FormEvent, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { uploadPostImage } from '@/external/repositories/postRepository'
import { createPostAction } from '@/external/handler/post/createPost'
import EyecatchImage from '@/components/EyecatchImage'
import type { Category } from '@/external/repositories/categoryRepository.types'
import type { Author } from '@/external/repositories/profileRepository.types'
import type { Tag } from '@/external/repositories/tagRepository.types'

type Props = {
  categories: Pick<Category, 'id' | 'name'>[]
  authors: Pick<Author, 'id' | 'display_name'>[]
  tags: Pick<Tag, 'id' | 'name'>[]
  redirectTo?: string
}

export default function PostCreate({ categories, authors, tags, redirectTo = '/' }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [imageUploadError, setImageUploadError] = useState<string | null>(null)
  const [categoryId, setCategoryId] = useState('')
  const authorId = authors.find((a) => a.display_name === '山田太郎')?.id ?? ''
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl)
      }
    }
  }, [imagePreviewUrl])

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setImageUploadError(null)

    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl)
    }

    setImageFile(file)
    setImagePreviewUrl(URL.createObjectURL(file))
  }

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

    let imagePath: string | null = null

    if (imageFile) {
      const { path, error: uploadError } = await uploadPostImage(imageFile)

      if (uploadError || !path) {
        setImageUploadError(uploadError ?? '画像のアップロードに失敗しました')
        setIsSubmitting(false)
        return
      }

      imagePath = path
    }

    const { data: post, error: postError } = await createPostAction(
      {
        title,
        slug,
        content,
        image_path: imagePath,
        category_id: categoryId || null,
        author_id: authorId,
        status,
        published_at: status === 'published' ? new Date().toISOString() : null,
      },
      selectedTagIds
    )

    if (postError || !post) {
      setError(postError)
      setIsSubmitting(false)
      return
    }

    router.push(status === 'published' ? '/' : redirectTo)
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
        <label htmlFor="imageFile" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          アイキャッチ画像
        </label>
        {imagePreviewUrl && <EyecatchImage src={imagePreviewUrl} alt={title || 'アイキャッチ画像プレビュー'} />}
        <input
          id="imageFile"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          disabled={isSubmitting}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-zinc-700 hover:file:bg-zinc-200 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:file:bg-zinc-800 dark:file:text-zinc-300 dark:hover:file:bg-zinc-700"
        />
        {imageUploadError && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{imageUploadError}</p>
        )}
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
