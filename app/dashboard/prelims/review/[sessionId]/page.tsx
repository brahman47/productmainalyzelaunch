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
  user_answers: Record<string, string>
  score: number
  created_at: string
}

interface PersonalizedExplanation {
  [key: number]: {
    text: string
    loading: boolean
  }
}

export default function PrelimsReviewPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params)
  const [session, setSession] = useState<PrelimsSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [personalizedExplanations, setPersonalizedExplanations] = useState<PersonalizedExplanation>({})
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

      // Load stored personalized explanations
      const { data: explanations } = await supabase
        .from('prelims_personalized_explanations')
        .select('*')
        .eq('session_id', sessionId)

      if (explanations) {
        const expMap: PersonalizedExplanation = {}
        explanations.forEach((exp) => {
          expMap[exp.question_index] = {
            text: exp.explanation,
            loading: false
          }
        })
        setPersonalizedExplanations(expMap)
      }
    } catch (error) {
      console.error('Error fetching session:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPersonalizedExplanation = async (qIndex: number, question: PrelimsQuestion, userAnswer: string) => {
    setPersonalizedExplanations(prev => ({
      ...prev,
      [qIndex]: { text: '', loading: true }
    }))

    try {
      const response = await fetch('/api/explain-wrong-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionId,
          questionIndex: qIndex,
          question: question.question,
          correctAnswer: question.options[question.correct_answer],
          userAnswer: question.options[userAnswer as keyof typeof question.options],
          correctOption: question.correct_answer.toUpperCase(),
          userOption: userAnswer.toUpperCase()
        })
      })

      const data = await response.json()

      if (data.success) {
        setPersonalizedExplanations(prev => ({
          ...prev,
          [qIndex]: { text: data.explanation, loading: false }
        }))
      }
    } catch (error) {
      console.error('Error getting personalized explanation:', error)
      setPersonalizedExplanations(prev => ({
        ...prev,
        [qIndex]: { 
          text: 'Unable to generate personalized explanation at this time.', 
          loading: false 
        }
      }))
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

  const percentage = Math.round((session.score / session.questions.length) * 100)

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Score Card */}
      <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-8 mb-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Results</h1>
          <p className="text-gray-600">
            <span className="font-semibold">{session.topic}</span> • {session.difficulty.replace('_', ' ').toUpperCase()}
          </p>
        </div>

        <div className="flex items-center justify-center gap-12 mb-6">
          <div className="text-center">
            <div className="text-6xl font-bold text-gray-900 mb-2">{session.score}</div>
            <div className="text-gray-600 font-medium">out of {session.questions.length}</div>
          </div>
          <div className="text-center">
            <div className="text-6xl font-bold text-gray-900 mb-2">{percentage}%</div>
            <div className="text-gray-600 font-medium">Score</div>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gray-900 h-3 rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={() => router.push('/dashboard/prelims')}
            className="flex-1 px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-all"
          >
            Practice Again
          </button>
          <button
            onClick={() => router.push('/dashboard/prelims/history')}
            className="flex-1 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
          >
            View History
          </button>
        </div>
      </div>

      {/* Questions Review */}
      <div className="space-y-6">
        {session.questions.map((question, qIndex) => {
          const userAnswer = session.user_answers[qIndex]
          const isCorrect = userAnswer === question.correct_answer
          const hasPersonalizedExplanation = qIndex in personalizedExplanations

          return (
            <div
              key={qIndex}
              className={`rounded-lg border-2 p-6 ${
                isCorrect
                  ? 'bg-green-50 border-green-300'
                  : 'bg-red-50 border-red-300'
              }`}
            >
              {/* Question Header */}
              <div className="flex items-start gap-4 mb-5">
                <span className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white ${
                  isCorrect ? 'bg-green-600' : 'bg-red-600'
                }`}>
                  {qIndex + 1}
                </span>
                <div className="flex-1">
                  <p className="text-gray-900 font-semibold text-lg leading-relaxed mb-2">
                    {question.question}
                  </p>
                  <div className="flex items-center gap-2">
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-green-700 font-bold text-sm">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Correct
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-700 font-bold text-sm">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        Incorrect
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-2 ml-14 mb-5">
                {Object.entries(question.options).map(([key, value]) => {
                  const isUserAnswer = userAnswer === key
                  const isCorrectAnswer = key === question.correct_answer

                  return (
                    <div
                      key={key}
                      className={`p-4 rounded-lg border-2 ${
                        isCorrectAnswer
                          ? 'bg-green-100 border-green-400'
                          : isUserAnswer && !isCorrect
                          ? 'bg-red-100 border-red-400'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="font-bold text-gray-900">{key.toUpperCase()}.</span>
                        <span className="flex-1 text-gray-900 font-medium">{value}</span>
                        {isCorrectAnswer && (
                          <span className="text-green-600 font-bold text-xl">✓</span>
                        )}
                        {isUserAnswer && !isCorrect && (
                          <span className="text-red-600 font-bold text-xl">✗</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Standard Explanation */}
              <div className="ml-14 p-5 bg-white rounded-lg border border-gray-300 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h4 className="font-bold text-gray-900">Explanation</h4>
                </div>
                <p className="text-gray-800 leading-relaxed">{question.explanation}</p>
              </div>

              {/* Mainalyze Mentor Personalized Feedback for Wrong Answers */}
              {!isCorrect && (
                <div className="ml-14">
                  {!hasPersonalizedExplanation ? (
                    <button
                      onClick={() => getPersonalizedExplanation(qIndex, question, userAnswer)}
                      className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-md"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Why was my answer wrong? Ask Mainalyze Mentor
                    </button>
                  ) : personalizedExplanations[qIndex].loading ? (
                    <div className="p-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
                      <div className="flex items-center gap-3 text-blue-700">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="font-semibold">Mainalyze Mentor is analyzing your answer...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-300 shadow-sm">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 mb-2">Mainalyze Mentor's Personalized Feedback</h4>
                          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                            {personalizedExplanations[qIndex].text}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
