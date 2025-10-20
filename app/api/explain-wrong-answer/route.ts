import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { explainWrongAnswerSchema } from '@/lib/validation';
import { logger } from '@/lib/logger';
import { ZodError } from 'zod';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate input with Zod
    let validatedData
    try {
      validatedData = explainWrongAnswerSchema.parse(body)
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          { error: 'Invalid input', details: error.issues },
          { status: 400 }
        )
      }
      throw error
    }
    
    const { sessionId, questionIndex, question, correctAnswer, userAnswer, correctOption, userOption } = validatedData;

    // Check if explanation already exists
    const { data: existing } = await supabase
      .from('prelims_personalized_explanations')
      .select('explanation')
      .eq('session_id', sessionId)
      .eq('question_index', questionIndex)
      .single();

    if (existing) {
      return NextResponse.json({ 
        success: true, 
        explanation: existing.explanation,
        cached: true 
      });
    }

    // Generate personalized explanation using Gemini API
    const prompt = `You are the Mainalyze Mentor, a friendly and encouraging UPSC preparation expert. A student answered a question incorrectly, and you need to explain why their answer was wrong and guide them to understand the correct answer.

**Question:** ${question}

**Correct Answer:** ${correctAnswer} (Option: ${correctOption})

**Student's Answer:** ${userAnswer} (Option: ${userOption})

Your task is to provide a warm, personalized explanation that:

1. **Acknowledges their attempt** (1 sentence, encouraging)
2. **Explains why their answer is incorrect** (2-3 sentences, clear and specific)
3. **Explains why the correct answer is right** (2-3 sentences with key facts/concepts)
4. **Provides a memory tip or study suggestion** (1-2 sentences, practical)

Keep your tone friendly, supportive, and mentor-like. Use "you" to address the student directly. Make it feel like personal mentorship, not a textbook explanation. Use around 150-200 words.

Focus on helping them learn and remember, not just correcting them.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 512
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      logger.error('Gemini API error:', errorData);
      throw new Error('Failed to generate explanation');
    }

    const data = await response.json();
    const explanation = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!explanation) {
      throw new Error('No response from AI');
    }

    // Store the explanation in database
    const { error: insertError } = await supabase
      .from('prelims_personalized_explanations')
      .insert({
        session_id: sessionId,
        question_index: questionIndex,
        explanation: explanation
      });

    if (insertError) {
      logger.error('Error storing explanation:', insertError);
      // Still return the explanation even if storage fails
    }

    return NextResponse.json({ 
      success: true, 
      explanation,
      cached: false
    });

  } catch (error) {
    logger.error('Error generating explanation:', error);
    return NextResponse.json(
      { error: 'Failed to generate explanation' },
      { status: 500 }
    );
  }
}
