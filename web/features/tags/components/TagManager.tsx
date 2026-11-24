'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import {
  createTag,
  updateTag,
  deleteTag,
} from '@/external/repositories/tagRepository'
import type { TagWithCount } from '@/types/tag'

type Props = {
  initialTags: TagWithCount[]
}

type EditState = {
  id: string
  name: string
  slug: string
}

type DeleteConfirmState = {
  tag: TagWithCount
  slugInput: string
}

export default function TagManager({ initialTags }: Props) {
  const router = useRouter()
  const [tags, setTags] = useState(initialTags)
  const [editState, setEditState] = useState<EditState | null>(null)
  const [newName, setNewName] = useState('')
  const [newSlug, setNewSlug] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState | null>(null)

  function handleNewNameChange(value: string) {
    setNewName(value)
    if (!newSlug) {
      setNewSlug(value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const { error: err } = await createTag({ name: newName, slug: newSlug })
    if (err) {
      setError(err)
      setIsSubmitting(false)
      return
    }

    setNewName('')
    setNewSlug('')
    setIsSubmitting(false)
    router.refresh()

    // 楽観的更新は refresh に任せるため再フェッチ後に反映される
  }

  async function handleUpdate(e: FormEvent) {
    e.preventDefault()
    if (!editState) return
    setError(null)
    setIsSubmitting(true)

    const { error: err } = await updateTag(editState.id, {
      name: editState.name,
      slug: editState.slug,
    })
    if (err) {
      setError(err)
      setIsSubmitting(false)
      return
    }

    setTags((prev) =>
      prev.map((t) =>
        t.id === editState.id
          ? { ...t, name: editState.name, slug: editState.slug }
          : t
      )
    )
    setEditState(null)
    setIsSubmitting(false)
    router.refresh()
  }

  async function handleDelete() {
    if (!deleteConfirm) return

    const { error: err } = await deleteTag(deleteConfirm.tag.id)
    if (err) {
      setError(err)
      setDeleteConfirm(null)
      return
    }

    setTags((prev) => prev.filter((t) => t.id !== deleteConfirm.tag.id))
    setDeleteConfirm(null)
    router.refresh()
  }

  return (
    <div className="space-y-8">
      {/* 新規作成フォーム */}
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          新しいタグを作成
        </h2>
        <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-40">
            <label
              htmlFor="new-name"
              className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              タグ名 <span className="text-red-500">*</span>
            </label>
            <input
              id="new-name"
              type="text"
              value={newName}
              onChange={(e) => handleNewNameChange(e.target.value)}
              required
              placeholder="例: JavaScript"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div className="flex-1 min-w-40">
            <label
              htmlFor="new-slug"
              className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              スラッグ <span className="text-red-500">*</span>
            </label>
            <input
              id="new-slug"
              type="text"
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
              required
              placeholder="例: javascript"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {isSubmitting ? '作成中...' : '作成'}
          </button>
        </form>
      </div>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      {/* タグ一覧 */}
      <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            タグ一覧（{tags.length}件）
          </h2>
        </div>

        {tags.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-zinc-400">
            タグがありません
          </p>
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {tags.map((tag) =>
              editState?.id === tag.id ? (
                <li key={tag.id} className="px-6 py-4">
                  <form onSubmit={handleUpdate} className="flex flex-wrap items-end gap-3">
                    <div className="flex-1 min-w-32">
                      <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        タグ名
                      </label>
                      <input
                        type="text"
                        value={editState.name}
                        onChange={(e) =>
                          setEditState({ ...editState, name: e.target.value })
                        }
                        required
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                    </div>
                    <div className="flex-1 min-w-32">
                      <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        スラッグ
                      </label>
                      <input
                        type="text"
                        value={editState.slug}
                        onChange={(e) =>
                          setEditState({ ...editState, slug: e.target.value })
                        }
                        required
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded border border-zinc-900 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                      >
                        保存
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditState(null)}
                        className="rounded border border-zinc-300 px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                      >
                        キャンセル
                      </button>
                    </div>
                  </form>
                </li>
              ) : (
                <li key={tag.id} className="flex items-center justify-between gap-4 px-6 py-4">
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      #{tag.name}
                    </span>
                    <span className="ml-3 text-xs text-zinc-400 dark:text-zinc-500">
                      {tag.slug}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">
                      {tag.postCount}件の記事
                    </span>
                    <button
                      onClick={() =>
                        setEditState({ id: tag.id, name: tag.name, slug: tag.slug })
                      }
                      className="rounded border border-zinc-300 px-2 py-0.5 text-xs text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ tag, slugInput: '' })}
                      className="rounded border border-red-200 px-2 py-0.5 text-xs text-red-500 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                    >
                      削除
                    </button>
                  </div>
                </li>
              )
            )}
          </ul>
        )}
      </div>
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
            <h3 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
              タグを削除
            </h3>

            {deleteConfirm.tag.postCount > 0 && (
              <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300">
                このタグは <strong>{deleteConfirm.tag.postCount} 件</strong> の記事で使用されています。削除するとそれらの記事からも取り除かれます。
              </div>
            )}

            <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
              削除を確認するには、スラッグ{' '}
              <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-xs text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                {deleteConfirm.tag.slug}
              </code>{' '}
              を入力してください。この操作は元に戻せません。
            </p>

            <input
              type="text"
              value={deleteConfirm.slugInput}
              onChange={(e) =>
                setDeleteConfirm({ ...deleteConfirm, slugInput: e.target.value })
              }
              placeholder={deleteConfirm.tag.slug}
              className="mb-4 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteConfirm.slugInput !== deleteConfirm.tag.slug}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
