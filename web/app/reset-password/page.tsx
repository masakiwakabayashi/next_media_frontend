import { Metadata } from 'next'
import { Suspense } from 'react'
import ResetPasswordForm from '@/features/auth/components/ResetPasswordForm'

export const metadata: Metadata = {
  title: '新しいパスワードの設定',
}

export default function ResetPasswordPage() {
  return (
    <div className="w-full">
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
}
