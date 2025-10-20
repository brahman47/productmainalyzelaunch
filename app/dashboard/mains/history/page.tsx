'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MainsEvaluation } from '@/types'

export default function MainsHistoryPage() {
  const [evaluations, setEvaluations] = useState<MainsEvaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchEvaluations()
    
    // Set up real-time subscription for updates
    const channel = supabase
      .channel('mains_evaluations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mains_evaluations',
        },
        () => {
          fetchEvaluations()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchEvaluations = async () => {
    try {
      console.log('Fetching mains evaluations...')
      const { data, error } = await supabase
        .from('mains_evaluations')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('Mains query result:', { data, error })
      
      if (error) {
        console.error('Supabase error details:', JSON.stringify(error, null, 2))
        console.error('Error message:', error.message)
        console.error('Error code:', error.code)
        console.error('Error hint:', error.hint)
        console.error('Error details:', error.details)
        throw error
      }
      
      setEvaluations(data || [])
      console.log('Evaluations set:', data?.length || 0)
    } catch (error: any) {
      console.error('Error fetching evaluations:', error)
      console.error('Full error:', JSON.stringify(error, null, 2))
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    }
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  const handleDelete = async (e: React.MouseEvent, evaluationId: string) => {
    e.stopPropagation() // Prevent card click navigation
    
    if (!confirm('Are you sure you want to delete this evaluation? This action cannot be undone.')) {
      return
    }

    setDeletingId(evaluationId)
    
    try {
      const { error } = await supabase
        .from('mains_evaluations')
        .delete()
        .eq('id', evaluationId)

      if (error) throw error
      
      // Update local state
      setEvaluations(prev => prev.filter(e => e.id !== evaluationId))
    } catch (error) {
      console.error('Error deleting evaluation:', error)
      alert('Failed to delete evaluation. Please try again.')
    } finally {
      setDeletingId(null)
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
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Evaluation History
        </h1>
        <p className="text-gray-500">Track your progress and review past evaluations</p>
        
        {evaluations.filter(e => e.status === 'pending').length > 0 && (
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-5 flex items-start gap-4">
            <svg className="animate-spin h-6 w-6 text-gray-600 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <div>
              <p className="text-sm font-bold text-gray-900 mb-1">
                {evaluations.filter(e => e.status === 'pending').length} evaluation{evaluations.filter(e => e.status === 'pending').length > 1 ? 's' : ''} in progress
              </p>
              <p className="text-sm text-gray-700">
                AI is analyzing your answers. Results will appear here automatically (typically 10-30 seconds).
              </p>
            </div>
          </div>
        )}
      </div>

      {evaluations.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-16 text-center">
          <p className="text-gray-900 text-xl font-bold mb-2">No evaluations yet</p>
          <p className="text-gray-500 mb-8">Start your journey by submitting your first answer</p>
          <a
            href="/dashboard/mains"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-all"
          >
            Submit Your First Answer →
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {evaluations.map((evaluation) => (
            <div
              key={evaluation.id}
              className="group bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-gray-300 transition-all relative"
            >
              <div 
                className="cursor-pointer"
                onClick={() => router.push(`/dashboard/mains/history/${evaluation.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-gray-700 transition-colors">
                      {evaluation.question}
                    </h3>
                    <p className="text-sm text-gray-400 flex items-center gap-2">
                      {new Date(evaluation.created_at).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-4 py-2 rounded-lg text-xs font-bold flex-shrink-0 ${
                        evaluation.status === 'pending'
                          ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                          : evaluation.status === 'completed'
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {evaluation.status === 'pending' ? 'PROCESSING' : evaluation.status === 'completed' ? 'COMPLETED' : 'FAILED'}
                    </span>
                    <button
                      onClick={(e) => handleDelete(e, evaluation.id)}
                      disabled={deletingId === evaluation.id}
                      className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete evaluation"
                    >
                      {deletingId === evaluation.id ? (
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

                {evaluation.status === 'completed' && evaluation.evaluation_result && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                          <span className="text-2xl font-bold text-gray-900">
                            {evaluation.evaluation_result.score}
                          </span>
                          <span className="text-sm text-gray-500 font-semibold">/{evaluation.evaluation_result.marks_allocated || 250}</span>
                        </div>
                      </div>
                      <span className="text-gray-700 font-bold group-hover:translate-x-2 transition-transform">
                        View Details →
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
