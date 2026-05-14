import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from '@/components/account/ProfileForm'

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-white tracking-wide">MY PROFILE</h1>
      <div className="bg-surface-card rounded-xl border border-surface-border p-6 max-w-lg">
        <p className="text-text-muted text-sm mb-1">Email</p>
        <p className="text-text-primary font-medium mb-6">{user.email}</p>
        {profile && <ProfileForm profile={profile} />}
      </div>
    </div>
  )
}
