import { Metadata } from 'next'
import AdminQuickLinks from '@/features/admin/components/AdminQuickLinks'
import DashboardStats from '@/features/admin/components/DashboardStats'

export const metadata: Metadata = {
  title: '管理者ダッシュボード',
}

export default function AdminPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          ダッシュボード
        </h1>
      </div>

      <AdminQuickLinks />

      <DashboardStats />
    </div>
  )
}
