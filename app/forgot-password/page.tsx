import { Metadata } from 'next'
import { Suspense } from 'react'
import ForgotPasswordForm from '@/features/auth/components/ForgotPasswordForm'

export const metadata: Metadata = {
  title: 'パスワードの再設定',
}

export default function ForgotPasswordPage() {
  return (
    <div className="w-full">
      <Suspense>
        <ForgotPasswordForm />
      </Suspense>
    </div>
  )
}
