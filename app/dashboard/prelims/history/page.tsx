'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PrelimsSession } from '@/types'

export default function PrelimsHistoryPage() {
  const [sessions, setSessions] = useState<PrelimsSession[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTopic, setSelectedTopic] = useState<string>('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      console.log('Fetching prelims sessions...')
      const { data, error } = await supabase
        .from('prelims_sessions')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('Prelims query result:', { data, error })
      
      if (error) {
        console.error('Supabase error details:', JSON.stringify(error, null, 2))
        console.error('Error message:', error.message)
        console.error('Error code:', error.code)
        console.error('Error hint:', error.hint)
        console.error('Error details:', error.details)
        throw error
      }
      
      setSessions(data || [])
      console.log('Sessions set:', data?.length || 0)
    } catch (error: any) {
      console.error('Error fetching sessions:', error)
      console.error('Full error:', JSON.stringify(error, null, 2))
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation() // Prevent card click navigation
    
    if (!confirm('Are you sure you want to delete this practice session? This action cannot be undone.')) {
      return
    }

    setDeletingId(sessionId)
    
    try {
      const { error } = await supabase
        .from('prelims_sessions')
        .delete()
        .eq('id', sessionId)

      if (error) throw error
      
      // Update local state
      setSessions(prev => prev.filter(s => s.id !== sessionId))
    } catch (error) {
      console.error('Error deleting session:', error)
      alert('Failed to delete session. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const getDifficultyBadge = (difficulty: string) => {
    const styles = {
      conceptual: 'bg-green-100 text-green-800',
      application: 'bg-yellow-100 text-yellow-800',
      upsc_level: 'bg-red-100 text-red-800',
    }
    const labels = {
      conceptual: 'Conceptual',
      application: 'Application',
      upsc_level: 'UPSC Level',
    }
    return {
      style: styles[difficulty as keyof typeof styles] || 'bg-gray-100 text-gray-800',
      label: labels[difficulty as keyof typeof labels] || difficulty,
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Prelims Question Bank</h1>
        <p className="text-gray-600 mb-6">Review all your practice sessions and questions</p>
        
        {/* Topic Filter */}
        {sessions.length > 0 && (
          <div className="flex items-center gap-3">
            <label htmlFor="topic-filter" className="text-sm font-semibold text-gray-700">
              Filter by Topic:
            </label>
            <select
              id="topic-filter"
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
            >
              <option value="all" className="text-gray-900">All Topics</option>
              {Array.from(new Set(sessions.map(s => s.topic))).sort().map(topic => (
                <option key={topic} value={topic} className="text-gray-900">
                  {topic}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {sessions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
          <p className="text-gray-600 text-lg mb-4">No practice sessions yet</p>
          <a
            href="/dashboard/prelims"
            className="inline-block px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Generate Your First Questions →
          </a>
        </div>
      ) : (
        <>
          {/* Group sessions by topic */}
          {Array.from(new Set(sessions.map(s => s.topic)))
            .filter(topic => selectedTopic === 'all' || topic === selectedTopic)
            .map(topic => {
            const topicSessions = sessions.filter(s => s.topic === topic)
            
            return (
              <div key={topic} className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">{topic}</h2>
                <div className="space-y-4">
                  {topicSessions.map((session) => {
                    const badge = getDifficultyBadge(session.difficulty)
                    const questionsCount = Array.isArray(session.questions) ? session.questions.length : 0

                    return (
                      <div
                        key={session.id}
                        className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-200 group relative"
                      >
                        <div 
                          className="cursor-pointer"
                          onClick={() => router.push(`/dashboard/prelims/history/${session.id}`)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <p className="text-sm text-gray-500">
                                {new Date(session.created_at).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.style}`}>
                                {badge.label}
                              </span>
                              <button
                                onClick={(e) => handleDelete(e, session.id)}
                                disabled={deletingId === session.id}
                                className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Delete session"
                              >
                                {deletingId === session.id ? (
                                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                ) : (
                                  <span className="text-sm font-bold">Delete</span>
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 text-sm text-gray-600">
                            <span>
                              <strong className="text-gray-900">{questionsCount}</strong> Questions
                            </span>
                            {session.score !== null && (
                              <span>
                                Score: <strong className="text-gray-900">{session.score}/{questionsCount}</strong> ({Math.round((session.score / questionsCount) * 100)}%)
                              </span>
                            )}
                            <span className="ml-auto text-gray-700 group-hover:text-gray-900 font-medium group-hover:translate-x-2 transition-transform">
                              View Details →
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}
