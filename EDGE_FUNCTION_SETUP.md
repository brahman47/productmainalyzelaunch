# Edge Function Setup - Complete ✅

## Deployment Status

✅ **Edge Function Deployed**: `evaluate-mains-answer`
- **Status**: ACTIVE
- **Version**: 3
- **URL**: `https://prdesheccbrfpjczvsif.supabase.co/functions/v1/evaluate-mains-answer`

## Environment Secrets Configured

✅ All required secrets are set in Supabase:
- `OPENROUTER_API_KEY` - For Gemini 2.5 Flash Lite API calls
- `SUPABASE_URL` - Auto-configured by Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Auto-configured by Supabase
- `SUPABASE_ANON_KEY` - Auto-configured by Supabase
- `SUPABASE_DB_URL` - Auto-configured by Supabase

## How It Works

### 1. User Submits Answer
- Frontend uploads images/PDF to Supabase Storage
- Calls `/api/evaluate-answer` with file URLs

### 2. Next.js API Route
- Creates evaluation record with `status: 'pending'`
- Invokes edge function (fire-and-forget)
- Returns immediately to user

### 3. Edge Function (Background)
- Receives evaluation ID and file URLs
- Calls OpenRouter Vision API with Gemini 2.5 Flash Lite
- AI analyzes images and provides strict UPSC evaluation
- Updates database with results
- Sets status to `completed` or `failed`

### 4. Real-time Updates
- Frontend listens to Supabase Realtime
- Automatically shows results when evaluation completes
- Typically 10-30 seconds for vision analysis

## Key Benefits

✅ **No Timeout Issues**: Edge function runs independently
✅ **Proper Error Handling**: Failed evaluations marked in database
✅ **Real-time Updates**: Users see progress automatically
✅ **Scalable**: Can handle multiple evaluations concurrently
✅ **Vision Analysis**: AI reads handwritten/typed answers from images

## Testing the Setup

To test if everything works:

1. **Start dev server**:
   ```powershell
   npm run dev
   ```

2. **Upload a test answer**:
   - Go to Dashboard → Mains Evaluation
   - Upload an image with a question and answer
   - Submit for evaluation

3. **Watch the magic**:
   - You'll see "Evaluation started" message
   - Navigate to History tab
   - Blue banner shows "1 evaluation in progress"
   - Wait 10-30 seconds
   - Page auto-updates with results

## Troubleshooting

### Edge Function Not Working?
```powershell
# Check function logs
supabase functions logs evaluate-mains-answer

# Redeploy if needed
supabase functions deploy evaluate-mains-answer --no-verify-jwt
```

### Secrets Not Set?
```powershell
# List current secrets
supabase secrets list

# Set missing secrets
supabase secrets set OPENROUTER_API_KEY="your-key-here"
```

### Database Stuck on "pending"?
- Check edge function logs for errors
- Verify OpenRouter API key is valid
- Ensure Supabase Storage URLs are publicly accessible

## Next Steps for Production

When deploying to Vercel:

1. **Set Environment Variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://prdesheccbrfpjczvsif.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
   SUPABASE_ANON_KEY=eyJhbGci...
   ```

2. **Edge Function is Already Live**: No additional deployment needed for edge functions - they're already running in Supabase cloud

3. **Storage Policies**: Ensure RLS policies allow authenticated users to read their uploaded files

## Architecture Diagram

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ 1. Upload images
       │ 2. Submit evaluation
       ▼
┌─────────────────────┐
│  Next.js API Route  │
│ /api/evaluate-answer│
└──────┬──────────────┘
       │ 3. Create DB record (pending)
       │ 4. Invoke edge function
       ▼
┌────────────────────────┐
│  Supabase Database     │◄───────┐
│  - evaluation record   │        │
│  - status: pending     │        │ 8. Update
└────────────────────────┘        │    status: completed
       ▲                           │
       │                           │
       │ 5. Real-time              │
       │    subscription           │
       │                           │
       ▼                           │
┌─────────────┐          ┌────────┴──────────┐
│   Browser   │          │   Edge Function   │
│  (auto-     │          │ evaluate-mains-   │
│   update)   │          │     answer        │
└─────────────┘          └────────┬──────────┘
                                  │
                                  │ 6. Call Vision API
                                  ▼
                         ┌──────────────────┐
                         │   OpenRouter     │
                         │ Gemini 2.5 Flash │
                         │      Lite        │
                         └──────────────────┘
                                  │
                                  │ 7. Return evaluation
                                  ▼
```

---

**Status**: ✅ Fully operational and ready for testing!
