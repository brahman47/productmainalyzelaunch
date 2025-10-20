'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'

export default function MainsEvaluationPage() {
  const [question, setQuestion] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [answerText, setAnswerText] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/gif': ['.gif'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 10,
    onDrop: (acceptedFiles) => {
      // Validate file sizes
      const oversizedFiles = acceptedFiles.filter(file => file.size > 10 * 1024 * 1024)
      if (oversizedFiles.length > 0) {
        setError(`Some files are too large: ${oversizedFiles.map(f => f.name).join(', ')}. Max 10MB per file.`)
        return
      }
      setFiles((prev) => [...prev, ...acceptedFiles])
      setError(null)
    },
    onDropRejected: (fileRejections) => {
      const reasons = fileRejections.map(fr => {
        return `${fr.file.name}: ${fr.errors[0]?.message}`
      }).join('\n')
      setError(`File upload rejected:\n${reasons}`)
    },
  })

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (files.length === 0 && !answerText.trim()) {
      setError('Please upload answer files or provide answer text')
      return
    }

    setLoading(true)

    try {
      // Upload files if any
      let uploadedUrls: string[] = []
      if (files.length > 0) {
        setUploadProgress('Uploading files...')
        const formData = new FormData()
        files.forEach((file) => formData.append('files', file))

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload files')
        }

        const uploadData = await uploadResponse.json()
        uploadedUrls = uploadData.urls
        setUploadProgress('Files uploaded successfully! ✓')
      }

      // Submit for evaluation
      setUploadProgress('Submitting for evaluation...')
      const response = await fetch('/api/evaluate-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question.trim() || null,
          answerText: answerText.trim() || null,
          answerFiles: uploadedUrls,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit evaluation')
      }

      const data = await response.json()
      setUploadProgress('Evaluation started! ✓')
      
      // Show success message
      setSuccess(`✅ Answer submitted successfully! Your evaluation is being processed by AI. Check the History tab in a few moments. Evaluation ID: ${data.evaluation.id.slice(0, 8)}...`)
      
      // Clear form
      setQuestion('')
      setAnswerText('')
      setFiles([])
      
      // Redirect to history page after showing success message
      setTimeout(() => {
        router.push('/dashboard/mains/history')
      }, 3000)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setUploadProgress('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Answer Evaluation
          </h1>
          <p className="text-gray-500">Upload your answer for AI-powered evaluation and detailed feedback</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-lg">
              <span className="text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-lg">
              <span className="text-sm">{success}</span>
            </div>
          )}

          {uploadProgress && (
            <div className="bg-gray-50 border border-gray-200 text-gray-700 px-5 py-4 rounded-lg flex items-center gap-3">
              <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm font-medium">{uploadProgress}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">
              Upload Answer Images/PDF <span className="text-red-500">*</span>
            </label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-all ${
                isDragActive
                  ? 'border-gray-900 bg-gray-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <div className="space-y-3">
                <p className="text-base font-medium text-gray-700">
                  {isDragActive
                    ? 'Drop files here...'
                    : 'Drag & drop images/PDF, or click to select'}
                </p>
                <p className="text-sm text-gray-500">Supports JPG, PNG, PDF • Max 10MB per file</p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-gray-700 font-medium mb-1">AI Vision Analysis</p>
                  <p className="text-xs text-gray-600">Our AI automatically extracts questions, answers, marks, and word limits from your uploads</p>
                </div>
              </div>
            </div>

            {files.length > 0 && (
              <div className="mt-5 space-y-2">
                <p className="text-sm font-bold text-gray-900">Selected files ({files.length}):</p>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="group flex items-center justify-between bg-gray-50 hover:bg-gray-100 px-4 py-3 rounded-lg border border-gray-200 transition-all"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-sm text-gray-700 font-medium truncate">{file.name}</span>
                        <span className="text-xs text-gray-400 flex-shrink-0">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="ml-3 text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading || !!success}
              className="flex-1 py-4 px-6 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading && (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {loading ? (uploadProgress || 'Processing...') : success ? 'Redirecting to History...' : 'Submit for Evaluation →'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/dashboard/mains/history')}
              className="px-6 py-4 bg-white border-2 border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              View History
            </button>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900 mb-3">How Mainalyze Works:</p>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-gray-900 font-bold">•</span>
                  <span>Upload images or PDF of your answer sheet</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-900 font-bold">•</span>
                  <span>AI extracts the first question, answer, marks, and word limit</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-900 font-bold">•</span>
                  <span>For multi-question documents, only the first question is evaluated</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-900 font-bold">•</span>
                  <span>Evaluation processes in background - check results in History tab</span>
                </li>
              </ul>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
