'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      
      // Check if user is admin and fetch profile
      if (user) {
        console.log('Current user email:', user.email)
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        console.log('Profile data:', profileData)
        console.log('Profile error:', error)
        console.log('Is admin:', profileData?.is_admin)
        
        setProfile(profileData)
        setIsAdmin(profileData?.is_admin === true)
      }
      
      setLoading(false)
    }

    getUser()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
                mainalyze
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Home
              </Link>
              <Link
                href="/dashboard/mains"
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Mains
              </Link>
              <Link
                href="/dashboard/prelims"
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Prelims
              </Link>
              
              <div className="relative ml-4">
                <button
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
                >
                  <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center text-white font-semibold">
                    {profile?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-sm font-semibold text-gray-900">
                      {profile?.full_name ? profile.full_name.substring(0, 13) : 'User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate max-w-[150px]">{user?.email}</p>
                  </div>
                  <svg className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${accountMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Account Dropdown */}
                {accountMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{profile?.full_name || 'User'}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setAccountMenuOpen(false)}
                      className="block w-full px-4 py-3 text-left text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
                    >
                      My Profile
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setAccountMenuOpen(false)}
                        className="block w-full px-4 py-3 text-left text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setAccountMenuOpen(false)
                        handleSignOut()
                      }}
                      className="w-full px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 hover:text-gray-900"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-4 space-y-2">
              <Link
                href="/dashboard"
                className="block text-gray-700 hover:text-gray-900 font-medium py-3 px-4 rounded-lg hover:bg-gray-50 transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/dashboard/mains"
                className="block text-gray-700 hover:text-gray-900 font-medium py-3 px-4 rounded-lg hover:bg-gray-50 transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                Mains
              </Link>
              <Link
                href="/dashboard/prelims"
                className="block text-gray-700 hover:text-gray-900 font-medium py-3 px-4 rounded-lg hover:bg-gray-50 transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                Prelims
              </Link>
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex items-center gap-3 px-4 py-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white font-semibold">
                    {profile?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{profile?.full_name || 'User'}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-semibold transition-all"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="py-8">{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600 text-sm">
            Made with 💖 by{' '}
            <a
              href="https://firebringerlabs.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-900 hover:text-gray-700 font-semibold transition-colors"
            >
              FirebringerLabs
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
