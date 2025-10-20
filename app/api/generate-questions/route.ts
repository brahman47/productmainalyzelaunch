import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { topic, numQuestions, difficulty } = body

    if (!topic || !numQuestions || !difficulty) {
      return NextResponse.json(
        { error: 'Topic, number of questions, and difficulty are required' },
        { status: 400 }
      )
    }

    if (numQuestions < 1 || numQuestions > 5) {
      return NextResponse.json(
        { error: 'Number of questions must be between 1 and 5' },
        { status: 400 }
      )
    }

    const difficultyDescriptions = {
      conceptual: 'basic conceptual understanding level',
      application: 'application and analytical level',
      upsc_level: 'actual UPSC Prelims standard with high difficulty and tricky options',
    }

    const prompt = `You are an expert UPSC Civil Services Prelims question creator. Generate exactly ${numQuestions} multiple-choice questions on the topic: ${topic}.

Difficulty Level: ${difficultyDescriptions[difficulty as keyof typeof difficultyDescriptions]}

Requirements:
- Each question must have 4 options (A, B, C, D)
- Only one correct answer
- Provide detailed explanation for the correct answer
- Questions should be relevant to UPSC CSE syllabus
- For UPSC level difficulty: include statement-based questions, assertion-reasoning, and tricky distractors
- Ensure factual accuracy

Return the response in the following JSON format:
{
  "questions": [
    {
      "question": "<question text>",
      "options": {
        "a": "<option A text>",
        "b": "<option B text>",
        "c": "<option C text>",
        "d": "<option D text>"
      },
      "correct_answer": "<a, b, c, or d>",
      "explanation": "<detailed explanation of correct answer>"
    }
  ]
}

Generate exactly ${numQuestions} question(s) now.`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            responseMimeType: 'application/json'
          }
        })
      }
    )

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Gemini API error:', errorData)
      throw new Error('Failed to generate questions')
    }

    const data = await response.json()
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text
    
    if (!resultText) {
      throw new Error('No response from Gemini API')
    }

    const questionData = JSON.parse(resultText)

    // Store session in database
    const { data: session, error: dbError } = await supabase
      .from('prelims_sessions')
      .insert({
        user_id: user.id,
        topic,
        difficulty,
        questions: questionData.questions,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'Failed to save questions' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      questions: questionData.questions,
    })
  } catch (error) {
    console.error('Error in generate-questions API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
