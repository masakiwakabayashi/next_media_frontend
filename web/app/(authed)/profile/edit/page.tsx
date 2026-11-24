import { Metadata } from 'next'
import ProfileEditor from '@/features/users/components/ProfileEditor'

export const metadata: Metadata = {
  title: 'プロフィール設定',
}

export default function ProfileEditPage() {
  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        プロフィール設定
      </h1>
      <ProfileEditor />
    </div>
  )
}
