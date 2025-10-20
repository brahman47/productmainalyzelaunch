'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types'
import Link from 'next/link'

interface UserWithStats extends Profile {
  mains_evaluations_count: number
  prelims_sessions_count: number
}

export default function UserDetailPage() {
  const [user, setUser] = useState<UserWithStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const params = useParams()
  const userId = params.userId as string
  const supabase = createClient()

  useEffect(() => {
    checkAdminAndFetchUser()
  }, [userId])

  const checkAdminAndFetchUser = async () => {
    try {
      // Check if user is logged in
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
      if (!currentUser) {
        router.push('/auth/login')
        return
      }

      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', currentUser.id)
        .single()

      if (!profile?.is_admin) {
        setError('Unauthorized: Admin access required')
        setTimeout(() => router.push('/dashboard'), 2000)
        return
      }

      // Fetch all users data to find this specific user
      const response = await fetch('/api/admin/users')
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data')
      }

      const data = await response.json()
      const foundUser = data.users.find((u: UserWithStats) => u.id === userId)
      
      if (!foundUser) {
        setError('User not found')
        return
      }
      
      setUser(foundUser)
    } catch (err: any) {
      console.error('Error:', err)
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-gray-900 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user details...</p>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-8 border border-red-200 max-w-md">
          <p className="text-red-600 font-medium mb-4">{error || 'User not found'}</p>
          <Link
            href="/admin/users"
            className="inline-block px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all"
          >
            Back to Users
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <Link
                  href="/admin/users"
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">User Details</h1>
              </div>
              <p className="text-gray-500 ml-14">View detailed information and activity</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Detail Content */}
          <div className="p-6 space-y-6">
            {/* User Info Card */}
            <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <div className="h-16 w-16 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                {user.full_name ? user.full_name[0].toUpperCase() : user.email[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">{user.full_name || 'N/A'}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
                {user.is_admin && (
                  <span className="inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full bg-gray-900 text-white">
                    Admin
                  </span>
                )}
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-500 mb-1">User ID</p>
                <p className="text-sm text-gray-900 font-mono break-all">{user.id}</p>
              </div>

              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-500 mb-1">Exam Preparing For</p>
                <p className="text-sm text-gray-900 font-semibold">
                  {user.exam_preparing_for || 'Not specified'}
                </p>
              </div>

              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-500 mb-1">Joined Date</p>
                <p className="text-sm text-gray-900">
                  {new Date(user.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>

              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-500 mb-1">Last Updated</p>
                <p className="text-sm text-gray-900">
                  {new Date(user.updated_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Activity Stats */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Activity Statistics</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-700 mb-2">Mains Evaluations</p>
                  <p className="text-4xl font-bold text-blue-900">{user.mains_evaluations_count}</p>
                </div>

                <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-700 mb-2">Prelims Sessions</p>
                  <p className="text-4xl font-bold text-green-900">{user.prelims_sessions_count}</p>
                </div>
              </div>
            </div>

            {/* Total Activity */}
            <div className="p-6 bg-gray-900 text-white rounded-lg">
              <p className="text-sm opacity-90 mb-1">Total Activity</p>
              <p className="text-3xl font-bold">
                {user.mains_evaluations_count + user.prelims_sessions_count}
              </p>
              <p className="text-xs opacity-75 mt-1">Combined evaluations and sessions</p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <Link
              href="/admin/users"
              className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-all"
            >
              Back to User List
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
