import { Metadata } from 'next'
import { Suspense } from 'react'
import LoginForm from '@/features/auth/components/LoginForm'

export const metadata: Metadata = {
  title: 'ログイン',
}

export default function LoginPage() {
  return (
    <div className="w-full">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  )
}
