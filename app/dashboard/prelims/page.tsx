'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DifficultyLevel } from '@/types'

const topics = [
  'Polity and Governance',
  'Economy',
  'History',
  'Geography',
  'Environment and Ecology',
  'Science and Technology',
  'International Relations',
  'Art and Culture',
  'Social Issues',
]

export default function PrelimsGeneratorPage() {
  const [topic, setTopic] = useState('')
  const [numQuestions, setNumQuestions] = useState(3)
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('conceptual')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          numQuestions,
          difficulty,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate questions')
      }

      const data = await response.json()
      // Redirect to test page
      router.push(`/dashboard/prelims/test/${data.sessionId}`)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Question Generator
          </h1>
          <p className="text-gray-500">Create custom MCQs tailored to your preparation needs</p>
        </div>

        <form onSubmit={handleGenerate} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-lg">
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="topic" className="block text-sm font-bold text-gray-900 mb-3">
                Select Topic
              </label>
              <select
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all text-gray-900 font-medium"
                required
              >
                <option value="" className="text-gray-500">Choose a topic...</option>
                {topics.map((t) => (
                  <option key={t} value={t} className="text-gray-900">
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="numQuestions" className="block text-sm font-bold text-gray-900 mb-3">
                Number of Questions
              </label>
              <select
                id="numQuestions"
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all text-gray-900 font-medium"
                required
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num} className="text-gray-900">
                    {num} Question{num > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-4">
              Difficulty Level
            </label>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { value: 'conceptual', label: 'Conceptual', desc: 'Basic understanding' },
                { value: 'application', label: 'Application', desc: 'Analytical thinking' },
                { value: 'upsc_level', label: 'UPSC Level', desc: 'High difficulty' },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`group relative flex flex-col p-5 border-2 rounded-lg cursor-pointer transition-all ${
                    difficulty === option.value
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="difficulty"
                    value={option.value}
                    checked={difficulty === option.value}
                    onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`font-bold ${
                      difficulty === option.value ? 'text-gray-900' : 'text-gray-900'
                    }`}>{option.label}</span>
                  </div>
                  <span className={`text-sm ${
                    difficulty === option.value ? 'text-gray-700' : 'text-gray-500'
                  }`}>{option.desc}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 px-6 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Generating...</span>
                </>
              ) : 'Generate Questions →'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/dashboard/prelims/history')}
              className="px-6 py-4 bg-white border-2 border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              View History
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
