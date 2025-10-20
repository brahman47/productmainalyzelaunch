'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MainsEvaluation } from '@/types'

interface MentorGuidance {
  [key: number]: {
    response: string
    loading: boolean
  }
}

export default function EvaluationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [evaluation, setEvaluation] = useState<MainsEvaluation | null>(null)
  const [loading, setLoading] = useState(true)
  const [mentorGuidance, setMentorGuidance] = useState<MentorGuidance>({})
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchEvaluation()
    loadStoredGuidance()
    
    // Set up real-time subscription for updates
    const channel = supabase
      .channel(`evaluation_${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'mains_evaluations',
          filter: `id=eq.${id}`,
        },
        () => {
          fetchEvaluation()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [id])

  const loadStoredGuidance = async () => {
    try {
      const { data, error } = await supabase
        .from('mains_mentor_guidance')
        .select('action_item_index, mentor_response')
        .eq('evaluation_id', id)

      if (error) throw error

      if (data) {
        const guidanceMap: MentorGuidance = {}
        data.forEach((item) => {
          guidanceMap[item.action_item_index] = {
            response: item.mentor_response,
            loading: false
          }
        })
        setMentorGuidance(guidanceMap)
      }
    } catch (error) {
      console.error('Error loading mentor guidance:', error)
    }
  }

  const handleAskMainalyze = async (index: number, actionItemText: string) => {
    // Set loading state
    setMentorGuidance(prev => ({
      ...prev,
      [index]: { response: '', loading: true }
    }))

    try {
      const response = await fetch('/api/mentor-guidance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evaluationId: id,
          actionItemIndex: index,
          actionItemText
        })
      })

      const data = await response.json()

      if (data.success) {
        setMentorGuidance(prev => ({
          ...prev,
          [index]: { response: data.mentorResponse, loading: false }
        }))
      } else {
        throw new Error(data.error || 'Failed to get mentor guidance')
      }
    } catch (error) {
      console.error('Error getting mentor guidance:', error)
      setMentorGuidance(prev => ({
        ...prev,
        [index]: { 
          response: 'Sorry, there was an error getting mentor guidance. Please try again.', 
          loading: false 
        }
      }))
    }
  }

  const fetchEvaluation = async () => {
    try {
      const { data, error } = await supabase
        .from('mains_evaluations')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching evaluation:', error)
        // If record doesn't exist, redirect to history
        if (error.code === 'PGRST116') {
          router.push('/dashboard/mains/history')
          return
        }
        throw error
      }
      setEvaluation(data)
    } catch (error) {
      console.error('Error fetching evaluation:', error)
      setEvaluation(null)
    } finally {
      setLoading(false)
    }
  }

  const getScorePercentage = () => {
    if (!evaluation?.evaluation_result) return 0
    const total = evaluation.evaluation_result.marks_allocated || 250
    return Math.round((evaluation.evaluation_result.score / total) * 100)
  }

  const getScoreCategory = () => {
    const percentage = getScorePercentage()
    if (percentage >= 80) return { label: 'Excellent', color: 'green' }
    if (percentage >= 60) return { label: 'Good', color: 'blue' }
    if (percentage >= 40) return { label: 'Average', color: 'yellow' }
    return { label: 'Needs Improvement', color: 'red' }
  }

  const handleDownloadPDF = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!evaluation) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-medium">Evaluation not found</p>
          <button
            onClick={() => router.push('/dashboard/mains/history')}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to History
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .page-break {
            page-break-before: always;
          }
        }
      `}</style>
      
      {/* Header */}
      <div className="mb-8 no-print">
        <button
          onClick={() => router.push('/dashboard/mains/history')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to History
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Evaluation Report</h1>
            <p className="text-gray-500">
              Submitted on {new Date(evaluation.created_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <div className="flex gap-3 items-center">
            <span
              className={`px-4 py-2 rounded-lg text-xs font-bold border ${
                evaluation.status === 'completed'
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : evaluation.status === 'pending'
                  ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}
            >
              {evaluation.status.toUpperCase()}
            </span>
            {evaluation.status === 'completed' && (
              <button
                onClick={handleDownloadPDF}
                className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all flex items-center gap-2 font-semibold"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PDF
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Evaluation Result */}
      {evaluation.status === 'completed' && evaluation.evaluation_result && (
        <div className="space-y-6">
          {/* Quick Summary Card */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-8 text-white shadow-lg">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm opacity-75 mb-2">Your Score</p>
                <p className="text-5xl font-bold mb-2">
                  {evaluation.evaluation_result.score}
                  <span className="text-2xl opacity-75">/{evaluation.evaluation_result.marks_allocated || 250}</span>
                </p>
                <div className="mt-3">
                  <span className={`px-4 py-1 rounded-full text-sm font-semibold ${
                    getScoreCategory().color === 'green' ? 'bg-green-500' :
                    getScoreCategory().color === 'blue' ? 'bg-blue-500' :
                    getScoreCategory().color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}>
                    {getScoreCategory().label}
                  </span>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-sm opacity-75 mb-2">Performance</p>
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-center">
                    <div className="text-5xl font-bold">{getScorePercentage()}%</div>
                  </div>
                  <div className="overflow-hidden h-3 text-xs flex rounded-full bg-gray-700">
                    <div
                      style={{ width: `${getScorePercentage()}%` }}
                      className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${
                        getScoreCategory().color === 'green' ? 'bg-green-500' :
                        getScoreCategory().color === 'blue' ? 'bg-blue-500' :
                        getScoreCategory().color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                    ></div>
                  </div>
                </div>
              </div>
              
              {evaluation.evaluation_result.word_limit && (
                <div className="text-center">
                  <p className="text-sm opacity-75 mb-2">Word Count</p>
                  <p className="text-5xl font-bold mb-2">{evaluation.evaluation_result.actual_word_count || 'N/A'}</p>
                  <p className="text-sm opacity-75">Limit: {evaluation.evaluation_result.word_limit} words</p>
                </div>
              )}
            </div>
          </div>

          {/* At a Glance Summary */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-bold text-green-900">Strengths</h3>
              </div>
              <p className="text-2xl font-bold text-green-900">{evaluation.evaluation_result.key_strengths?.length || 0}</p>
              <p className="text-sm text-green-700 mt-1">Areas where you excelled</p>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="font-bold text-yellow-900">Improvements</h3>
              </div>
              <p className="text-2xl font-bold text-yellow-900">{evaluation.evaluation_result.key_weaknesses?.length || 0}</p>
              <p className="text-sm text-yellow-700 mt-1">Focus areas identified</p>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="font-bold text-blue-900">Action Items</h3>
              </div>
              <p className="text-2xl font-bold text-blue-900">{evaluation.evaluation_result.suggestions?.length || 0}</p>
              <p className="text-sm text-blue-700 mt-1">Next steps to improve</p>
            </div>
          </div>

          {/* Extracted Question */}
          {evaluation.evaluation_result.extracted_question && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Extracted Question from Image</h2>
              <div className="text-gray-800 bg-gray-50 p-5 rounded-lg border border-gray-200 whitespace-pre-wrap leading-relaxed">
                {evaluation.evaluation_result.extracted_question}
              </div>
            </div>
          )}

          {/* Detailed Feedback */}
          <div className="space-y-4">
            {/* Structure */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Structure & Organization</h2>
              <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                {evaluation.evaluation_result.structure}
              </div>
            </div>

            {/* Content Quality */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Content Quality</h2>
              <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                {evaluation.evaluation_result.content_quality}
              </div>
            </div>

            {/* Presentation */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Presentation & Language</h2>
              <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                {evaluation.evaluation_result.presentation}
              </div>
            </div>

            {/* Word Limit Adherence */}
            {evaluation.evaluation_result.adherence_to_word_limit && (
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Word Limit Adherence</h2>
                <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {evaluation.evaluation_result.adherence_to_word_limit}
                </div>
              </div>
            )}
          </div>

          {/* Strengths */}
          {evaluation.evaluation_result.key_strengths && evaluation.evaluation_result.key_strengths.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">What You Did Well</h2>
              </div>
              <ul className="space-y-3">
                {evaluation.evaluation_result.key_strengths.map((strength: string, index: number) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-gray-800 bg-green-50 p-4 rounded-lg border border-green-200"
                  >
                    <span className="text-green-600 font-bold text-xl flex-shrink-0 mt-0.5">✓</span>
                    <div className="flex-1">
                      <p className="font-medium leading-relaxed">{strength}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Weaknesses */}
          {evaluation.evaluation_result.key_weaknesses && evaluation.evaluation_result.key_weaknesses.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-yellow-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Areas to Focus On</h2>
              </div>
              <ul className="space-y-3">
                {evaluation.evaluation_result.key_weaknesses.map((weakness: string, index: number) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-gray-800 bg-yellow-50 p-4 rounded-lg border border-yellow-200"
                  >
                    <span className="text-yellow-600 font-bold text-xl flex-shrink-0 mt-0.5">⚠</span>
                    <div className="flex-1">
                      <p className="font-medium leading-relaxed">{weakness}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {evaluation.evaluation_result.suggestions && evaluation.evaluation_result.suggestions.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Your Action Plan</h2>
              </div>
              <div className="space-y-4">
                {evaluation.evaluation_result.suggestions.map((suggestion: string, index: number) => (
                  <div
                    key={index}
                    className="bg-blue-50 p-5 rounded-lg border border-blue-200"
                  >
                    <div className="flex items-start gap-4 text-gray-800">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium leading-relaxed mb-3">{suggestion}</p>
                        
                        {/* Ask Mainalyze Button */}
                        {!mentorGuidance[index] && (
                          <button
                            onClick={() => handleAskMainalyze(index, suggestion)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Ask Mainalyze
                          </button>
                        )}

                        {/* Loading State */}
                        {mentorGuidance[index]?.loading && (
                          <div className="mt-3 p-4 bg-white rounded-lg border border-blue-300">
                            <div className="flex items-center gap-3 text-blue-600">
                              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span className="font-medium">Getting personalized guidance from your mentor...</span>
                            </div>
                          </div>
                        )}

                        {/* Mentor Response */}
                        {mentorGuidance[index]?.response && !mentorGuidance[index]?.loading && (
                          <div className="mt-3 p-5 bg-white rounded-lg border-2 border-blue-300 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                              </div>
                              <h4 className="font-bold text-gray-900">Mentor Guidance</h4>
                            </div>
                            <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed">
                              {mentorGuidance[index].response}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Steps Action Box */}
          <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-3">
              <svg className="w-8 h-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              What's Next?
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:bg-gray-100 transition-colors">
                <h3 className="font-bold mb-2 text-lg text-gray-900">📝 Practice Again</h3>
                <p className="text-sm text-gray-600 mb-4">Apply the feedback and try a similar question to track improvement.</p>
                <button
                  onClick={() => router.push('/dashboard/mains')}
                  className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-all"
                >
                  Submit New Answer
                </button>
              </div>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:bg-gray-100 transition-colors">
                <h3 className="font-bold mb-2 text-lg text-gray-900">📊 Track Progress</h3>
                <p className="text-sm text-gray-600 mb-4">Review your past evaluations to see how you're improving over time.</p>
                <button
                  onClick={() => router.push('/dashboard/mains/history')}
                  className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-all"
                >
                  View All Evaluations
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pending State */}
      {evaluation.status === 'pending' && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
          <div className="animate-spin mx-auto h-12 w-12 border-4 border-gray-900 border-t-transparent rounded-full mb-6"></div>
          <p className="text-xl font-semibold text-gray-900 mb-2">Evaluation in Progress</p>
          <p className="text-gray-600">AI is analyzing your answer. This page will update automatically.</p>
        </div>
      )}

      {/* Failed State */}
      {evaluation.status === 'failed' && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
          <p className="text-xl font-semibold text-gray-900 mb-2">Evaluation Failed</p>
          <p className="text-gray-600 mb-6">Something went wrong while processing your answer.</p>
          <button
            onClick={() => router.push('/dashboard/mains')}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-semibold"
          >
            Submit New Answer →
          </button>
        </div>
      )}
    </div>
  )
}
