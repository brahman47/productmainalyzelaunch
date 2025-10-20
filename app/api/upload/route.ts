import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Route segment config for larger uploads
export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get content type and check if it's multipart
    const contentType = request.headers.get('content-type') || ''
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ 
        error: 'Invalid content type. Expected multipart/form-data' 
      }, { status: 400 })
    }

    // Parse form data with error handling
    let formData: FormData
    try {
      formData = await request.formData()
    } catch (parseError: any) {
      console.error('FormData parse error:', parseError)
      return NextResponse.json({ 
        error: 'Failed to parse file upload. Try uploading smaller files (under 10MB each) or fewer files at once.',
        details: parseError.message 
      }, { status: 400 })
    }

    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    console.log(`Uploading ${files.length} file(s) for user ${user.id}`)

    const uploadedUrls: string[] = []
    const errors: string[] = []

    for (const file of files) {
      try {
        // Validate file
        if (!file || !file.name) {
          errors.push('Invalid file object')
          continue
        }

        // Check file size (10MB limit for now due to Next.js restrictions)
        const maxSize = 10 * 1024 * 1024 // 10MB
        if (file.size > maxSize) {
          errors.push(`${file.name}: File too large (max 10MB per file)`)
          continue
        }

        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        
        // Convert File to ArrayBuffer for upload
        const arrayBuffer = await file.arrayBuffer()
        const buffer = new Uint8Array(arrayBuffer)

        const { data, error } = await supabase.storage
          .from('answer-uploads')
          .upload(fileName, buffer, {
            contentType: file.type,
            upsert: false
          })

        if (error) {
          console.error('Upload error for', file.name, ':', error)
          errors.push(`${file.name}: ${error.message}`)
          continue
        }

        const { data: { publicUrl } } = supabase.storage
          .from('answer-uploads')
          .getPublicUrl(fileName)

        uploadedUrls.push(publicUrl)
        console.log(`Successfully uploaded: ${file.name} -> ${publicUrl}`)
      } catch (fileError: any) {
        console.error('Error processing file:', file.name, fileError)
        errors.push(`${file.name}: ${fileError.message}`)
      }
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to upload any files',
        details: errors 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error: any) {
    console.error('Error in upload API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}
