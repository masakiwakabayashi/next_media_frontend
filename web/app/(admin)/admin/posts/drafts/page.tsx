import DraftPostList from '@/features/posts/components/DraftPostList'

export default function DraftsPage() {
  return (
    <div className="flex items-center justify-center font-sans">
      <div className="w-full max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          下書き一覧
        </h1>
        <DraftPostList />
      </div>
    </div>
  )
}
