import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { evaluationId, answerFiles, providedQuestion, providedAnswerText } = await req.json()

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log(`Processing evaluation ${evaluationId}`)

    // Get evaluation record
    const { data: evaluation, error: fetchError } = await supabase
      .from('mains_evaluations')
      .select('*')
      .eq('id', evaluationId)
      .single()

    if (fetchError || !evaluation) {
      throw new Error('Evaluation not found')
    }

    console.log('Fetching images from Supabase Storage...')

    // Download images from Supabase Storage and convert to base64
    const imageContents = []

    for (const fileUrl of answerFiles) {
      try {
        // Extract the file path from the public URL
        const filePath = fileUrl.split('/answer-uploads/')[1]
        
        if (!filePath) {
          console.error('Invalid file URL:', fileUrl)
          continue
        }

        console.log('Downloading file:', filePath)

        // Download the file from storage
        const { data: fileData, error: downloadError } = await supabase
          .storage
          .from('answer-uploads')
          .download(filePath)

        if (downloadError) {
          console.error('Error downloading file:', downloadError)
          continue
        }

        console.log('File downloaded, size:', fileData.size, 'bytes')

        // Check file size (limit to 10MB for base64 conversion)
        if (fileData.size > 10 * 1024 * 1024) {
          console.error('File too large for processing:', filePath)
          continue
        }

        // Get or detect mime type
        let fileMimeType = fileData.type
        if (!fileMimeType || fileMimeType === 'application/octet-stream') {
          // Try to detect from file extension
          const extension = filePath.split('.').pop()?.toLowerCase()
          const mimeTypeMap: Record<string, string> = {
            'pdf': 'application/pdf',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'webp': 'image/webp',
            'gif': 'image/gif'
          }
          fileMimeType = mimeTypeMap[extension || ''] || 'application/pdf'
        }

        console.log('Processing file with mime type:', fileMimeType)

        // Convert to base64 using proper method for Deno
        const arrayBuffer = await fileData.arrayBuffer()
        const uint8Array = new Uint8Array(arrayBuffer)
        
        // Use chunked conversion for better performance
        let binary = ''
        const chunkSize = 0x8000 // 32KB chunks to avoid stack overflow
        for (let i = 0; i < uint8Array.length; i += chunkSize) {
          const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length))
          binary += String.fromCharCode.apply(null, Array.from(chunk))
        }
        const base64 = btoa(binary)
        
        imageContents.push({
          type: 'image_url',
          image_url: {
            url: `data:${fileMimeType};base64,${base64}`
          }
        })

        console.log(`Converted ${filePath} to base64 (${fileMimeType}, ${base64.length} chars)`)
      } catch (error) {
        console.error('Error processing file:', fileUrl, error)
      }
    }

    if (imageContents.length === 0) {
      throw new Error('Failed to process any images from storage')
    }

    console.log(`Successfully prepared ${imageContents.length} image(s) for analysis`)

    const prompt = `You are an expert UPSC Civil Services Mains examiner. Analyze the uploaded answer sheet image(s).

⚠️ CRITICAL INSTRUCTIONS - READ CAREFULLY:
1. **ONLY EVALUATE THE FIRST QUESTION** - If you see multiple questions (Q1, Q2, Q3, etc.), analyze ONLY the first one
2. **STOP SCANNING when you detect a second question** - Look for markers like "Q2", "Question 2", "2.", or a new question number
3. **Extract the COMPLETE first question text** - If the question appears in both English and Hindi (or any other language), include BOTH versions exactly as they appear
4. Note any marks allocation for the first question (e.g., "10 marks", "250 marks")
5. Note any word limit mentioned for the first question (e.g., "150 words", "250 words")
6. **Completely ignore any content after the first question ends** - Do not read or analyze subsequent questions

${providedQuestion ? `Reference (student-provided): "${providedQuestion}"` : ''}
${providedAnswerText ? `Additional context (student-provided): "${providedAnswerText}"` : ''}

Provide a comprehensive evaluation in the following JSON format:
{
  "extracted_question": "<the COMPLETE first question text from the image - if it has both English and Hindi/other language versions, include BOTH exactly as shown>",
  "marks_allocated": <number of marks for this question, e.g., 10, 15, 250>,
  "word_limit": <expected word limit if mentioned, e.g., 150, 250>,
  "actual_word_count": <approximate word count of the answer>,
  "score": <score out of the marks_allocated>,
  "structure": "<detailed evaluation of answer structure: introduction, body paragraphs, conclusion, logical flow>",
  "content_quality": "<evaluation of content depth, factual accuracy, relevance to question, use of examples, balanced perspective, analytical depth>",
  "presentation": "<evaluation of language quality, grammar, clarity, expression, use of diagrams/flowcharts if relevant - NOTE: Do NOT critique handwriting legibility or penmanship as OCR interpretation can vary. Focus only on the substance of language, grammar, and clarity of expression.>",
  "adherence_to_word_limit": "<comment on whether answer is within word limit, too short, or too long>",
  "key_strengths": ["<strength 1>", "<strength 2>", "..."],
  "key_weaknesses": ["<weakness 1>", "<weakness 2>", "..."],
  "suggestions": ["<specific actionable improvement 1>", "<specific actionable improvement 2>", "..."]
}

🎯 EVALUATION STANDARDS - EXTREMELY STRICT UPSC MARKING:

**Scoring Philosophy:**
- Be RUTHLESSLY STRICT - This is UPSC Civil Services, not a college exam
- **Maximum 50% marks** should be awarded only to exceptionally brilliant answers that demonstrate:
  * Perfect structure with clear Introduction-Body-Conclusion
  * Multiple dimensions and perspectives covered
  * Current, relevant examples with data/statistics
  * Critical analysis and original insights
  * Flawless presentation and diagrams where needed
  * Perfect adherence to word limit
- **40-50% range**: Outstanding answers with minor scope for improvement
- **30-40% range**: Good answers with substantial content but lacking depth/examples
- **20-30% range**: Average answers with basic understanding but major gaps
- **10-20% range**: Below average answers with significant deficiencies
- **0-10% range**: Poor answers with fundamental errors or irrelevance
- **0 marks**: Award ZERO without hesitation for:
  * Completely irrelevant answers
  * Factually incorrect information
  * Extremely poor structure or presentation
  * Missing key dimensions of the question

**UPSC-Specific Expectations (be harsh on these):**
- Factual accuracy: Penalize heavily for outdated or wrong information
- Multi-dimensional analysis: Generic answers get low marks
- Current affairs integration: Answers without recent examples lose marks
- Balanced perspective: One-sided answers are inadequate
- Structure: Poor structure = automatic deduction
- Examples & Data: Vague statements without evidence = weak answer
- Diagrams/Flowcharts: Award bonus marks ONLY if truly value-adding
- Critical thinking: Mere description without analysis = mediocre marks
- Word limit: Exceeding by >20% or falling short by >30% = penalty

⚠️ IMPORTANT - Handwriting & OCR Considerations:
- **NEVER critique handwriting legibility, penmanship, or neatness**
- OCR/vision interpretation can misread handwriting - what appears as "awkward phrasing" or "grammatical errors" might be OCR misinterpretation
- If text is unclear or ambiguous, assume it's an OCR issue and give benefit of doubt
- Focus ONLY on substantive issues: content quality, structure, factual accuracy, analytical depth
- Evaluate presentation based on: clarity of expression, proper grammar in the intended text, logical flow of ideas
- Do NOT mention: "handwriting is cramped", "illegible", "difficult to read", "poor penmanship", etc.
- If you genuinely cannot understand a section due to image quality, simply skip critiquing that part

**Feedback Approach - Be a Caring but Strict Mentor:**
- Point out EVERY weakness, don't sugarcoat
- For each weakness, provide SPECIFIC examples of what should have been written
- Show exactly how model answers look (write 2-3 sentences as examples)
- Explain WHY something is wrong, not just WHAT is wrong
- Give concrete action steps: "Instead of writing X, you should write Y because..."
- Compare with UPSC toppers' approach when relevant
- Mention specific reports, committees, data, case studies that should have been used
- For good points, explain what made them effective
- End with a clear roadmap: "To improve this answer, first do X, then Y, finally Z"

**Be Honest and Direct:**
- If answer is poor, clearly state: "This answer would not score well in UPSC"
- If fundamental understanding is missing, say so explicitly
- If presentation is illegible, deduct marks and mention it
- Don't inflate scores - students need to know their real level
- Your job is to prepare them for actual UPSC, not to make them feel good

Remember: You're helping aspirants face one of India's toughest exams. Honest, detailed, strict feedback now will help them succeed later.`

    console.log('Calling Gemini API for vision analysis...')

    // Prepare parts for Gemini API
    const parts = [
      { text: prompt }
    ]

    // Add files to parts
    for (const content of imageContents) {
      const base64Data = content.image_url.url.split(',')[1]
      const mimeType = content.image_url.url.split(';')[0].split(':')[1]
      
      parts.push({
        inline_data: {
          mime_type: mimeType,
          data: base64Data
        }
      })
    }

    // Call Gemini API directly
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: parts
        }],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 8192,
          responseMimeType: "application/json"
        }
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error:', errorText)
      throw new Error(`Gemini API failed: ${errorText}`)
    }

    const aiResponse = await response.json()
    console.log('Gemini API response received')
    
    if (!aiResponse.candidates || aiResponse.candidates.length === 0) {
      console.error('No candidates in response:', JSON.stringify(aiResponse))
      throw new Error('No response from Gemini API')
    }
    
    const resultText = aiResponse.candidates[0].content.parts[0].text
    console.log('Raw AI response text (first 500 chars):', resultText.substring(0, 500))
    
    // Try to parse JSON, with better error handling
    let evaluationResult
    try {
      // Remove markdown code blocks if present
      let cleanedText = resultText.trim()
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/^```json\n/, '').replace(/\n```$/, '')
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```\n/, '').replace(/\n```$/, '')
      }
      
      evaluationResult = JSON.parse(cleanedText)
    } catch (parseError: any) {
      console.error('JSON parse error:', parseError)
      console.error('Failed to parse text:', resultText)
      throw new Error(`Failed to parse AI response as JSON: ${parseError.message}`)
    }

    console.log('AI evaluation completed successfully')

    // Update evaluation with result
    const { error: updateError } = await supabase
      .from('mains_evaluations')
      .update({
        question: evaluationResult.extracted_question || providedQuestion || 'Question extracted from image',
        evaluation_result: evaluationResult,
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', evaluationId)

    if (updateError) {
      console.error('Database update error:', updateError)
      throw updateError
    }

    console.log(`Evaluation ${evaluationId} completed and saved`)

    return new Response(
      JSON.stringify({ success: true, evaluationId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('Error in edge function:', error)

    // Try to update status to failed
    if (error.evaluationId) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        await supabase
          .from('mains_evaluations')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', error.evaluationId)
      } catch (dbError) {
        console.error('Failed to update status to failed:', dbError)
      }
    }

    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
