'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PrelimsSession } from '@/types'

export default function PrelimsSessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [session, setSession] = useState<PrelimsSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [personalizedExplanations, setPersonalizedExplanations] = useState<{ [key: number]: string }>({})
  const [loadingExplanation, setLoadingExplanation] = useState<{ [key: number]: boolean }>({})
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchSession()
  }, [id])

  const fetchSession = async () => {
    try {
      const { data, error } = await supabase
        .from('prelims_sessions')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching session:', error)
        // If record doesn't exist, redirect to history
        if (error.code === 'PGRST116') {
          router.push('/dashboard/prelims/history')
          return
        }
        throw error
      }
      setSession(data)
      
      // Load stored personalized explanations
      if (data) {
        loadStoredExplanations(data.id)
      }
    } catch (error) {
      console.error('Error fetching session:', error)
      setSession(null)
    } finally {
      setLoading(false)
    }
  }

  const loadStoredExplanations = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('prelims_personalized_explanations')
        .select('*')
        .eq('session_id', sessionId)

      if (error) throw error

      if (data) {
        const explanationsMap: { [key: number]: string } = {}
        data.forEach((item) => {
          explanationsMap[item.question_index] = item.explanation
        })
        setPersonalizedExplanations(explanationsMap)
      }
    } catch (error) {
      console.error('Error loading stored explanations:', error)
    }
  }

  const handleAskMentor = async (questionIndex: number, question: any, userAnswer: string, correctAnswer: string) => {
    setLoadingExplanation({ ...loadingExplanation, [questionIndex]: true })

    try {
      const response = await fetch('/api/explain-wrong-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: id,
          questionIndex,
          question: question.question,
          correctAnswer: question.options[correctAnswer],
          userAnswer: question.options[userAnswer],
          correctOption: correctAnswer.toUpperCase(),
          userOption: userAnswer.toUpperCase(),
        }),
      })

      const data = await response.json()

      if (data.explanation) {
        setPersonalizedExplanations({
          ...personalizedExplanations,
          [questionIndex]: data.explanation,
        })
      }
    } catch (error) {
      console.error('Error getting mentor explanation:', error)
    } finally {
      setLoadingExplanation({ ...loadingExplanation, [questionIndex]: false })
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
      <div className="max-w-5xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
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
          <button
            onClick={() => router.push('/dashboard/prelims/history')}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to History
          </button>
        </div>
      </div>
    )
  }

  const badge = getDifficultyBadge(session.difficulty)
  const questionsCount = Array.isArray(session.questions) ? session.questions.length : 0
  const percentage = questionsCount > 0 && session.score !== null ? Math.round((session.score / questionsCount) * 100) : 0
  const userAnswers = session.user_answers || {}

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/dashboard/prelims/history')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to History
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{session.topic}</h1>
            <p className="text-sm text-gray-500">
              Practice Session • {new Date(session.created_at).toLocaleString()}
            </p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${badge.style}`}>
            {badge.label}
          </span>
        </div>
      </div>

      {/* Summary Card */}
      {session.score !== null && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-8 text-white mb-6">
          <div className="grid grid-cols-2 gap-8">
            <div className="text-center">
              <p className="text-lg mb-2 opacity-90">Score</p>
              <p className="text-6xl font-bold mb-2">{session.score}</p>
              <p className="text-sm opacity-75">out of {questionsCount}</p>
            </div>
            <div className="text-center">
              <p className="text-lg mb-2 opacity-90">Percentage</p>
              <p className="text-6xl font-bold mb-2">{percentage}%</p>
              <p className="text-sm opacity-75">Score</p>
            </div>
          </div>
          <div className="mt-4 bg-white/20 rounded-full h-2">
            <div
              className="bg-white rounded-full h-2 transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Questions */}
      <div className="space-y-6">
        {Array.isArray(session.questions) &&
          session.questions.map((question: any, index: number) => {
            const userAnswer = userAnswers[index]
            const isCorrect = userAnswer === question.correct_answer
            
            return (
              <div 
                key={index} 
                className={`rounded-lg shadow-sm p-6 border-2 ${
                  isCorrect 
                    ? 'bg-green-50 border-green-500' 
                    : 'bg-red-50 border-red-500'
                }`}
              >
                <div className="flex items-start gap-3 mb-4">
                  <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                    isCorrect 
                      ? 'bg-green-600 text-white' 
                      : 'bg-red-600 text-white'
                  }`}>
                    {index + 1}
                  </span>
                  <p className="text-gray-900 font-medium flex-1 text-lg">{question.question}</p>
                </div>

                <div className="space-y-3 ml-11">
                  {Object.entries(question.options).map(([key, value]: [string, any]) => {
                    const isThisCorrect = key === question.correct_answer
                    const isUserChoice = key === userAnswer
                    
                    return (
                      <div
                        key={key}
                        className={`p-4 rounded-lg border-2 ${
                          isThisCorrect
                            ? 'bg-green-100 border-green-600'
                            : isUserChoice
                            ? 'bg-red-100 border-red-600'
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <span className="text-gray-900">
                            <span className="font-semibold">{key.toUpperCase()}.</span> {value}
                          </span>
                          <div className="flex items-center gap-2">
                            {isUserChoice && !isThisCorrect && (
                              <span className="text-red-600 font-semibold text-sm">Your Answer</span>
                            )}
                            {isUserChoice && isThisCorrect && (
                              <span className="text-green-600 font-semibold text-sm">Your Answer</span>
                            )}
                            {isThisCorrect && (
                              <span className="text-green-600 font-semibold text-xl">✓</span>
                            )}
                            {isUserChoice && !isThisCorrect && (
                              <span className="text-red-600 font-semibold text-xl">✗</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {question.explanation && (
                  <div className="mt-4 ml-11 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-semibold text-blue-900 mb-2">Explanation:</p>
                    <p className="text-sm text-blue-900 leading-relaxed">{question.explanation}</p>
                  </div>
                )}

                {/* Personalized Mentor Explanation for Wrong Answers */}
                {!isCorrect && (
                  <div className="mt-4 ml-11">
                    {!personalizedExplanations[index] && (
                      <button
                        onClick={() => handleAskMentor(index, question, userAnswer, question.correct_answer)}
                        disabled={loadingExplanation[index]}
                        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {loadingExplanation[index] ? (
                          <>
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Mainalyze Mentor is analyzing...</span>
                          </>
                        ) : (
                          <>
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Ask Mainalyze Mentor</span>
                          </>
                        )}
                      </button>
                    )}
                    
                    {personalizedExplanations[index] && (
                      <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200 shadow-sm">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900 mb-3">
                              Mainalyze Mentor's Personalized Feedback
                            </h4>
                            <div className="prose prose-sm max-w-none text-gray-800">
                              <p className="whitespace-pre-wrap leading-relaxed">{personalizedExplanations[index]}</p>
                            </div>
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
