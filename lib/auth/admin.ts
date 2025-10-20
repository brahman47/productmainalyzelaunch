import { createClient } from '@/lib/supabase/server'

export async function checkIsAdmin(): Promise<boolean> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return false
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  
  return profile?.is_admin === true
}

export async function requireAdmin() {
  const isAdmin = await checkIsAdmin()
  
  if (!isAdmin) {
    throw new Error('Unauthorized: Admin access required')
  }
  
  return true
}
