import { getDashboardStats } from '@/external/repositories/adminRepository'

type StatCardProps = {
  label: string
  value: number
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-1 text-3xl font-bold text-zinc-900 dark:text-zinc-100">{value}</p>
    </div>
  )
}

export default async function DashboardStats() {
  const stats = await getDashboardStats()

  return (
    <div className="grid grid-cols-3 gap-4">
      <StatCard label="公開記事" value={stats.publishedCount} />
      <StatCard label="下書き" value={stats.draftCount} />
      <StatCard label="タグ" value={stats.tagCount} />
    </div>
  )
}
