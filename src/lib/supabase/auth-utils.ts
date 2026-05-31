import { createClient } from '@/lib/supabase/server'

/**
 * Checks if the current authenticated user has the 'admin' role.
 * Throws an error if the user is not authenticated or is not an admin.
 */
export async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('Unauthorized: Authentication required')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || profile?.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required')
  }

  return { user, profile }
}
