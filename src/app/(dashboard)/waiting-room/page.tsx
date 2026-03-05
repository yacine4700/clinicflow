// src/app/(dashboard)/waiting-room/page.tsx
import { auth } from '@/lib/auth'
import { getWaitingList, getTodayStats } from '@/lib/actions/waiting-room'
import { WaitingRoomClient } from '@/components/waiting-room/waiting-room-client'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Waiting Room' }
export const dynamic = 'force-dynamic'

export default async function WaitingRoomPage() {
  const session = await auth()
  const [entries, stats] = await Promise.all([
    getWaitingList(),
    getTodayStats(),
  ])

  return (
    <WaitingRoomClient
      initialEntries={entries as any}
      stats={stats}
      isDoctor={session?.user?.role === 'DOCTOR'}
    />
  )
}
