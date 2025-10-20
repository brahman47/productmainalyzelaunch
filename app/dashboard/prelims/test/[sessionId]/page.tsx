'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PrelimsQuestion } from '@/types'

interface PrelimsSession {
  id: string
  user_id: string
  topic: string
  difficulty: string
  questions: PrelimsQuestion[]
  user_answers: Record<string, string> | null
  score: number | null
  created_at: string
}

export default function PrelimsTestPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params)
  const [session, setSession] = useState<PrelimsSession | null>(null)
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchSession()
  }, [sessionId])

  const fetchSession = async () => {
    try {
      const { data, error } = await supabase
        .from('prelims_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (error) throw error

      setSession(data)
      // If already submitted, redirect to review
      if (data.user_answers && data.score !== null) {
        router.push(`/dashboard/prelims/review/${sessionId}`)
      }
    } catch (error) {
      console.error('Error fetching session:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }))
  }

  const calculateScore = () => {
    if (!session) return 0
    let correct = 0
    session.questions.forEach((question, index) => {
      if (userAnswers[index] === question.correct_answer) {
        correct++
      }
    })
    return correct
  }

  const handleSubmit = async () => {
    if (!session) return
    
    const score = calculateScore()
    setSubmitting(true)

    try {
      const { error } = await supabase
        .from('prelims_sessions')
        .update({
          user_answers: userAnswers,
          score: score
        })
        .eq('id', sessionId)

      if (error) throw error

      // Redirect to review page
      router.push(`/dashboard/prelims/review/${sessionId}`)
    } catch (error) {
      console.error('Error submitting answers:', error)
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-medium">Session not found</p>
        </div>
      </div>
    )
  }

  const allAnswered = Object.keys(userAnswers).length === session.questions.length

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Practice Test</h1>
            <p className="text-gray-600">
              <span className="font-semibold">{session.topic}</span> • {session.questions.length} Questions • {session.difficulty.replace('_', ' ').toUpperCase()}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 mb-1">Progress</div>
            <div className="text-2xl font-bold text-gray-900">
              {Object.keys(userAnswers).length} / {session.questions.length}
            </div>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6 mb-6">
        {session.questions.map((question, qIndex) => {
          const isAnswered = qIndex in userAnswers

          return (
            <div
              key={qIndex}
              className={`bg-white rounded-lg shadow-sm border-2 p-6 transition-all ${
                isAnswered ? 'border-gray-900' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start gap-4 mb-5">
                <span className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                  isAnswered ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-700'
                }`}>
                  {qIndex + 1}
                </span>
                <p className="text-gray-900 font-semibold flex-1 text-lg leading-relaxed">
                  {question.question}
                </p>
              </div>

              <div className="space-y-3 ml-14">
                {Object.entries(question.options).map(([key, value]) => {
                  const isSelected = userAnswers[qIndex] === key

                  return (
                    <label
                      key={key}
                      className={`group flex items-start gap-3 p-4 rounded-lg cursor-pointer transition-all border-2 ${
                        isSelected
                          ? 'bg-gray-100 border-gray-900'
                          : 'bg-gray-50 hover:bg-gray-100 border-transparent hover:border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${qIndex}`}
                        value={key}
                        checked={isSelected}
                        onChange={() => handleAnswerSelect(qIndex, key)}
                        className="mt-1 w-4 h-4 text-gray-900"
                      />
                      <span className="flex-1 text-gray-900 font-medium">
                        <span className="font-bold text-gray-900">{key.toUpperCase()}.</span> {value}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Submit Button */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky bottom-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">
              {allAnswered ? 'All questions answered!' : `${session.questions.length - Object.keys(userAnswers).length} question(s) remaining`}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-gray-900 h-2 rounded-full transition-all"
                style={{ width: `${(Object.keys(userAnswers).length / session.questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
            className="ml-6 px-8 py-4 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Submitting...</span>
              </>
            ) : 'Submit Test →'}
          </button>
        </div>
      </div>
    </div>
  )
}
