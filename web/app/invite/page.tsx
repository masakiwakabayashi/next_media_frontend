import { Metadata } from 'next'
import { Suspense } from 'react'
import AcceptInviteForm from '@/features/auth/components/AcceptInviteForm'

export const metadata: Metadata = {
  title: '招待の受諾',
}

export default function InvitePage() {
  return (
    <div className="w-full">
      <Suspense>
        <AcceptInviteForm />
      </Suspense>
    </div>
  )
}
