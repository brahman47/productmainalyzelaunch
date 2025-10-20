import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    // Check if user is admin
    await requireAdmin()
    
    // Audit log admin action
    logger.audit('ADMIN_VIEW_USERS', user?.id, {
      action: 'Viewed all users list',
      timestamp: new Date().toISOString()
    })
    
    // Fetch all users with their profiles and activity stats
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (profilesError) {
      throw profilesError
    }
    
    // Get evaluation counts for each user
    const { data: evalCounts } = await supabase
      .from('mains_evaluations')
      .select('user_id')
    
    // Get session counts for each user
    const { data: sessionCounts } = await supabase
      .from('prelims_sessions')
      .select('user_id')
    
    // Count evaluations and sessions per user
    const evalCountMap = new Map<string, number>()
    const sessionCountMap = new Map<string, number>()
    
    evalCounts?.forEach(item => {
      evalCountMap.set(item.user_id, (evalCountMap.get(item.user_id) || 0) + 1)
    })
    
    sessionCounts?.forEach(item => {
      sessionCountMap.set(item.user_id, (sessionCountMap.get(item.user_id) || 0) + 1)
    })
    
    // Combine data
    const usersWithStats = profiles?.map(profile => ({
      ...profile,
      mains_evaluations_count: evalCountMap.get(profile.id) || 0,
      prelims_sessions_count: sessionCountMap.get(profile.id) || 0,
    }))
    
    return NextResponse.json({
      users: usersWithStats,
      total_users: usersWithStats?.length || 0,
    })
  } catch (error: any) {
    logger.error('Error fetching users:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status: error.message === 'Unauthorized: Admin access required' ? 403 : 500 }
    )
  }
}
