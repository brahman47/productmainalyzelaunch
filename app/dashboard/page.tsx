'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    mainsEvaluations: 0,
    prelimsSessions: 0,
    recentActivity: [] as any[],
  })
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAdminAndFetchData()
  }, [])

  const checkAdminAndFetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single()
        
        const adminStatus = profile?.is_admin === true
        setIsAdmin(adminStatus)
        
        // If admin, redirect to admin dashboard
        if (adminStatus) {
          router.push('/admin')
          return
        }
      }
      
      // Only fetch dashboard data if not admin
      await fetchDashboardData()
    } catch (error) {
      console.error('Error checking admin status:', error)
      await fetchDashboardData()
    }
  }

  const fetchDashboardData = async () => {
    try {
      // Fetch mains evaluations count
      const { count: mainsCount } = await supabase
        .from('mains_evaluations')
        .select('*', { count: 'exact', head: true })

      // Fetch prelims sessions count
      const { count: prelimsCount } = await supabase
        .from('prelims_sessions')
        .select('*', { count: 'exact', head: true })

      // Fetch recent activity
      const { data: recentMains } = await supabase
        .from('mains_evaluations')
        .select('id, question, status, created_at')
        .order('created_at', { ascending: false })
        .limit(3)

      const { data: recentPrelims } = await supabase
        .from('prelims_sessions')
        .select('id, topic, difficulty, created_at')
        .order('created_at', { ascending: false })
        .limit(3)

      const combined = [
        ...(recentMains || []).map((item) => ({
          ...item,
          type: 'mains',
        })),
        ...(recentPrelims || []).map((item) => ({
          ...item,
          type: 'prelims',
        })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      setStats({
        mainsEvaluations: mainsCount || 0,
        prelimsSessions: prelimsCount || 0,
        recentActivity: combined.slice(0, 5),
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || isAdmin) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-8">
          <div className="h-12 bg-gray-200 rounded w-1/3"></div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Mains Evaluation</h3>
            </div>
            <p className="text-gray-600 text-sm mb-6">Get AI-powered feedback on your answers</p>
            <div className="flex gap-3">
              <Link
                href="/dashboard/mains"
                className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                Submit Answer →
              </Link>
              <Link
                href="/dashboard/mains/history"
                className="px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                title="View History"
              >
                History
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Prelims Practice</h3>
            </div>
            <p className="text-gray-600 text-sm mb-6">Generate custom MCQs for practice</p>
            <div className="flex gap-3">
              <Link
                href="/dashboard/prelims"
                className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                Generate Questions →
              </Link>
              <Link
                href="/dashboard/prelims/history"
                className="px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                title="View History"
              >
                History
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          
          {stats.recentActivity.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No activity yet. Start practicing to see your progress!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentActivity.map((activity) => (
                <div
                  key={`${activity.type}-${activity.id}`}
                  className="p-5 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-1">
                        {activity.type === 'mains'
                          ? activity.question.substring(0, 60) + '...'
                          : `${activity.topic} - ${activity.difficulty}`}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(activity.created_at).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {activity.type === 'mains' && activity.status && (
                      <span
                        className={`px-3 py-1 rounded text-xs font-semibold ${
                          activity.status === 'completed'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : activity.status === 'pending'
                            ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {activity.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
