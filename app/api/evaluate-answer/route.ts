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
    const { question, answerText, answerFiles } = body

    if (!answerFiles || answerFiles.length === 0) {
      return NextResponse.json({ error: 'Please upload at least one image or PDF file' }, { status: 400 })
    }

    // Create evaluation record with pending status
    const { data: evaluation, error: dbError } = await supabase
      .from('mains_evaluations')
      .insert({
        user_id: user.id,
        question: question || 'Question will be extracted from uploaded files',
        answer_files: answerFiles,
        status: 'pending',
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'Failed to create evaluation' }, { status: 500 })
    }

    // Invoke Supabase Edge Function for background processing
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/evaluate-mains-answer`
    
    console.log('Invoking edge function:', edgeFunctionUrl)
    console.log('Evaluation ID:', evaluation.id)
    
    // Fire and forget - don't await the edge function
    fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        evaluationId: evaluation.id,
        answerFiles,
        providedQuestion: question,
        providedAnswerText: answerText,
      }),
    })
    .then(response => {
      console.log('Edge function response status:', response.status)
      return response.text()
    })
    .then(text => {
      console.log('Edge function response:', text)
    })
    .catch(error => {
      console.error('Edge function invocation error:', error)
      // Update status to failed
      supabase
        .from('mains_evaluations')
        .update({ status: 'failed' })
        .eq('id', evaluation.id)
        .then(() => console.log('Updated status to failed'))
    })

    return NextResponse.json({
      success: true,
      evaluation,
      message: 'Evaluation started. AI is analyzing your answer from the uploaded files.',
    })
  } catch (error) {
    console.error('Error in evaluate-answer API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
