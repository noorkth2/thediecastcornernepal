import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getDropById } from '@/lib/supabase/queries/drops'
import { createClient } from '@/lib/supabase/server'
import { DropDetailClient } from './DropDetailClient'

interface DropDetailPageProps {
  params: Promise<{ id: string }>
}

export const revalidate = 0 // live drop page must not cache

export async function generateMetadata(props: DropDetailPageProps): Promise<Metadata> {
  const params = await props.params
  const dropId = parseInt(params.id)
  const drop = await getDropById(dropId)

  if (!drop || !drop.product) return { title: 'Drop Not Found' }

  const title = `EXCLUSIVE DROP: ${drop.product.title}`
  const description = `Live launch for ${drop.product.title}. Limited quantities available. Don't miss out on this exclusive drop at The Diecast Corner Nepal.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: drop.product.image_url ? [{ url: drop.product.image_url }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: drop.product.image_url ? [drop.product.image_url] : [],
    },
  }
}

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
