import { createClient } from '@/lib/supabase/server'
import { ClientNavbar } from './ClientNavbar'

export async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', user.id)
      .single()
    
    profile = data
  }

  return <ClientNavbar user={user} profile={profile} />
}
