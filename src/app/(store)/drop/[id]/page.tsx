import { redirect } from 'next/navigation'
import { getDropById } from '@/lib/supabase/queries/drops'
import { createClient } from '@/lib/supabase/server'
import { DropDetailClient } from './DropDetailClient'

interface DropDetailPageProps {
  params: Promise<{ id: string }>
}

export const revalidate = 0 // live drop page must not cache

export default async function DropDetailPage(props: DropDetailPageProps) {
  const params = await props.params
  const dropId = parseInt(params.id)

  const drop = await getDropById(dropId)
  if (!drop || !drop.product) {
    redirect('/drops')
  }

  // If the drop is not live yet, redirect to waiting room
  const now = new Date()
  const dropsAt = new Date(drop.drops_at)
  if (drop.status === 'scheduled' || (drop.status === 'waiting' && now < dropsAt)) {
    redirect(`/drop/${drop.id}/waiting`)
  }

  // Get active session user
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <DropDetailClient
      drop={drop}
      product={drop.product}
      user={user}
    />
  )
}
