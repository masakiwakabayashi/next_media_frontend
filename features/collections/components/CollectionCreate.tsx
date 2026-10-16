'use client'

import { useEffect, useState, FormEvent, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { uploadPostImage } from '@/external/repositories/postRepository'
import { createCollectionAction } from '@/external/handler/collection/createCollection'
import EyecatchImage from '@/components/EyecatchImage'
import type { CollectionLinkedPost } from '@/types/collection'
import type { PostOption } from '@/types/post'

type Props = {
  postOptions: PostOption[]
}

export default function CollectionCreate({ postOptions }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [imageUploadError, setImageUploadError] = useState<string | null>(null)
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [linkedPosts, setLinkedPosts] = useState<CollectionLinkedPost[]>([])
  const [postToAdd, setPostToAdd] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const linkedIds = new Set(linkedPosts.map((post) => post.id))
  const addablePosts = postOptions.filter((post) => !linkedIds.has(post.id))

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

  function handleAddPost() {
    const post = postOptions.find((option) => option.id === postToAdd)
    if (!post || linkedIds.has(post.id)) return
    setLinkedPosts((prev) => [...prev, post])
    setPostToAdd('')
  }

  function handleRemovePost(id: string) {
    setLinkedPosts((prev) => prev.filter((post) => post.id !== id))
  }

  function movePost(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= linkedPosts.length) return
    setLinkedPosts((prev) => {
      const next = [...prev]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
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

    const { data: collection, error: createError } = await createCollectionAction(
      {
        title,
        slug,
        description: description || null,
        image_path: imagePath,
        status,
        published_at: status === 'published' ? new Date().toISOString() : null,
      },
      linkedPosts.map((post) => post.id)
    )

    if (createError || !collection) {
      setError(createError ?? '特集の作成に失敗しました')
      setIsSubmitting(false)
      return
    }

    // 下書きは一般の特集ページで表示されないため、続けて編集できる画面へ遷移する
    router.push(
      status === 'published'
        ? `/collections/${slug}`
        : `/admin/collections/${slug}/edit`
    )
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
        <label
          htmlFor="title"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
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
        <label
          htmlFor="slug"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
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

      {/* 説明 */}
      <div>
        <label
          htmlFor="description"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          説明
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>

      {/* アイキャッチ画像 */}
      <div>
        <label
          htmlFor="imageFile"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          アイキャッチ画像
        </label>
        {imagePreviewUrl && (
          <EyecatchImage src={imagePreviewUrl} alt={title || 'アイキャッチ画像プレビュー'} />
        )}
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

      {/* 紐づく記事 */}
      <div>
        <span className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          紐づく記事
        </span>

        {linkedPosts.length === 0 ? (
          <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">
            紐づく記事はありません
          </p>
        ) : (
          <ol className="mb-3 divide-y divide-zinc-100 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {linkedPosts.map((post, index) => (
              <li
                key={post.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <span className="min-w-0 truncate text-sm text-zinc-800 dark:text-zinc-200">
                  <span className="mr-2 text-zinc-400">{index + 1}.</span>
                  {post.title}
                </span>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => movePost(index, -1)}
                    disabled={index === 0}
                    aria-label={`${post.title}を上へ`}
                    className="rounded border border-zinc-300 px-2 py-0.5 text-xs text-zinc-600 hover:bg-zinc-50 disabled:opacity-30 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => movePost(index, 1)}
                    disabled={index === linkedPosts.length - 1}
                    aria-label={`${post.title}を下へ`}
                    className="rounded border border-zinc-300 px-2 py-0.5 text-xs text-zinc-600 hover:bg-zinc-50 disabled:opacity-30 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    ▼
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemovePost(post.id)}
                    className="ml-1 rounded border border-red-200 px-2 py-0.5 text-xs text-red-500 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                  >
                    削除
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="追加する記事"
            value={postToAdd}
            onChange={(e) => setPostToAdd(e.target.value)}
            className="flex-1 min-w-40 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <option value="">記事を選択...</option>
            {addablePosts.map((post) => (
              <option key={post.id} value={post.id}>
                {post.title}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleAddPost}
            disabled={!postToAdd}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            追加
          </button>
        </div>
      </div>

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
