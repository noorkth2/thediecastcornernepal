import { redirect } from 'next/navigation'
import { getDropById } from '@/lib/supabase/queries/drops'
import { WaitingRoomClient } from './WaitingRoomClient'

interface WaitingRoomPageProps {
  params: Promise<{ id: string }>
}

export const revalidate = 0

export default async function WaitingRoomPage(props: WaitingRoomPageProps) {
  const params = await props.params
  const dropId = parseInt(params.id)

  const drop = await getDropById(dropId)
  if (!drop || !drop.product) {
    redirect('/drops')
  }

  // If the drop is already live, redirect straight to drop page
  const now = new Date()
  const dropsAt = new Date(drop.drops_at)
  if (now >= dropsAt || drop.status === 'live') {
    redirect(`/drop/${drop.id}`)
  }

  return (
    <WaitingRoomClient drop={drop} product={drop.product} />
  )
}
