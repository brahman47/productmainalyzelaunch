import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { evaluationId, actionItemIndex, actionItemText } = await request.json();

    if (!evaluationId || actionItemIndex === undefined || !actionItemText) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if guidance already exists
    const { data: existingGuidance } = await supabase
      .from('mains_mentor_guidance')
      .select('mentor_response')
      .eq('evaluation_id', evaluationId)
      .eq('action_item_index', actionItemIndex)
      .single();

    if (existingGuidance) {
      return NextResponse.json({ 
        success: true, 
        mentorResponse: existingGuidance.mentor_response,
        cached: true 
      });
    }

    // Verify the evaluation belongs to the user
    const { data: evaluation, error: evalError } = await supabase
      .from('mains_evaluations')
      .select('user_id, evaluation_result')
      .eq('id', evaluationId)
      .single();

    if (evalError || !evaluation || evaluation.user_id !== user.id) {
      return NextResponse.json({ error: 'Evaluation not found' }, { status: 404 });
    }

    // Generate mentor guidance using Gemini API directly
    const prompt = `You are Mainalyze, an expert UPSC Mains exam mentor. A student received the following action item in their answer evaluation feedback:

"${actionItemText}"

Your task is to provide detailed, practical, and encouraging mentorship guidance on HOW to implement this specific action item. 

Structure your response as follows:

1. **Understanding the Gap**: Briefly explain why this is important for UPSC Mains success (1-2 sentences)

2. **Step-by-Step Implementation**: Provide 3-5 concrete, actionable steps the student can take immediately. Be specific with examples.

3. **Practice Technique**: Suggest a specific practice exercise or technique they can use to master this skill.

4. **Resources & Examples**: Recommend specific study materials, reference books, or example answers they should review (be specific - mention actual UPSC toppers' answer styles, standard reference books, etc.)

5. **Timeline & Tracking**: Suggest a realistic timeline for improvement and how to track progress.

Keep your tone warm, encouraging, and mentor-like. Make the guidance practical enough that a student can start implementing it TODAY. Use around 300-400 words.

Remember: This is personalized mentorship, not generic advice. Be specific and actionable.`;

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
          maxOutputTokens: 1024
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', errorData);
      throw new Error('Failed to generate mentor guidance');
    }

    const data = await response.json();
    const mentorResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!mentorResponse) {
      throw new Error('No response from AI');
    }

    // Store the mentor guidance in database
    const { error: insertError } = await supabase
      .from('mains_mentor_guidance')
      .insert({
        evaluation_id: evaluationId,
        action_item_index: actionItemIndex,
        action_item_text: actionItemText,
        mentor_response: mentorResponse
      });

    if (insertError) {
      console.error('Error storing mentor guidance:', insertError);
      // Still return the response even if storage fails
    }

    return NextResponse.json({ 
      success: true, 
      mentorResponse,
      cached: false 
    });

  } catch (error) {
    console.error('Error generating mentor guidance:', error);
    return NextResponse.json(
      { error: 'Failed to generate mentor guidance' },
      { status: 500 }
    );
  }
}
