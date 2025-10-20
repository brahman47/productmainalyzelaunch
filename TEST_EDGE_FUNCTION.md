# Test Edge Function

This script tests if the edge function is working properly.

## Quick Test

```powershell
# Test CORS preflight
Invoke-WebRequest -Uri "https://prdesheccbrfpjczvsif.supabase.co/functions/v1/evaluate-mains-answer" -Method OPTIONS

# Expected: Should return 200 OK with CORS headers
```

## Full Integration Test

To test the complete evaluation flow:

1. **Start the Next.js dev server**:
```powershell
npm run dev
```

2. **Open browser and navigate to**: http://localhost:3000

3. **Login/Signup** with any email

4. **Go to Mains Evaluation page**

5. **Upload a test image** with:
   - A question written at the top (e.g., "Q1. Discuss climate change. [10 marks, 150 words]")
   - Your answer below it

6. **Submit for evaluation**

7. **Go to History tab** - you should see:
   - Blue banner: "1 evaluation in progress"
   - After 10-30 seconds, the evaluation completes
   - Click to view detailed feedback

## Check Edge Function Logs

If something goes wrong:

```powershell
# View recent logs
supabase functions logs evaluate-mains-answer --tail

# View logs from last hour
supabase functions logs evaluate-mains-answer --since 1h
```

## Verify Secrets

```powershell
supabase secrets list
```

Should show:
- OPENROUTER_API_KEY ✓
- SUPABASE_URL ✓
- SUPABASE_SERVICE_ROLE_KEY ✓
- SUPABASE_ANON_KEY ✓
- SUPABASE_DB_URL ✓

## Troubleshooting

### Function not responding?
```powershell
# Redeploy
supabase functions deploy evaluate-mains-answer --no-verify-jwt
```

### Evaluation stuck on "pending"?
1. Check function logs: `supabase functions logs evaluate-mains-answer`
2. Verify OpenRouter API key is valid
3. Check if uploaded images are publicly accessible

### Database errors?
- Ensure RLS policies allow authenticated users to insert/update evaluations
- Check if user is properly authenticated
