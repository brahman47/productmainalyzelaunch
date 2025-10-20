# UPSC Preparation Platform - Setup Guide

## Quick Start Guide

### Step 1: Initial Setup

1. **Install dependencies**:
   ```powershell
   npm install
   ```

2. **Copy environment template**:
   ```powershell
   Copy-Item .env.example .env.local
   ```

### Step 2: Supabase Setup

1. **Create a Supabase project**:
   - Go to https://supabase.com
   - Click "New Project"
   - Note your project URL and anon key

2. **Set up database**:
   - Open Supabase SQL Editor
   - Copy entire content from `supabase/schema.sql`
   - Execute the SQL

3. **Create storage bucket**:
   - Go to Storage in Supabase dashboard
   - Create bucket named `answer-uploads`
   - Set as **private**
   - Policies are already set in schema.sql

4. **Configure authentication**:
   - Go to Authentication → Providers
   - Enable Email provider
   - (Optional) Enable email confirmation

### Step 3: OpenRouter Setup

1. **Get API key**:
   - Visit https://openrouter.ai
   - Sign up/Login
   - Go to Keys section
   - Generate new API key
   - Add credits to your account

2. **Verify Gemini access**:
   - Model used: `google/gemini-2.0-flash-exp:free`
   - Check model availability on OpenRouter

### Step 4: Environment Configuration

Edit `.env.local` with your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
OPENROUTER_API_KEY=sk-or-v1-your-key-here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Step 5: Run the Application

```powershell
npm run dev
```

Visit http://localhost:3000

## Features Checklist

After setup, test these features:

- [ ] User signup and login
- [ ] Upload mains answer (image/PDF)
- [ ] View evaluation status and results
- [ ] Generate prelims questions
- [ ] Answer prelims questions
- [ ] View question bank history
- [ ] View mains evaluation history

## Deployment to Vercel

### Prerequisites
- GitHub repository with your code
- Vercel account

### Steps

1. **Push to GitHub**:
   ```powershell
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository

3. **Configure environment variables** in Vercel:
   - Add all variables from `.env.local`
   - Update `NEXT_PUBLIC_SITE_URL` to your Vercel domain

4. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete

5. **Update Supabase redirect URLs**:
   - Go to Supabase Authentication settings
   - Add your Vercel URL to allowed redirect URLs
   - Format: `https://your-app.vercel.app/auth/callback`

## Troubleshooting

### Database Issues
- **Error: relation does not exist**
  - Solution: Run `supabase/schema.sql` again

- **Error: RLS policy violation**
  - Solution: Check if user is authenticated
  - Verify policies in database

### Authentication Issues
- **Redirect loop**
  - Solution: Clear browser cookies
  - Check middleware.ts configuration

- **Session not persisting**
  - Solution: Verify Supabase URL and keys
  - Check browser localStorage

### API Issues
- **OpenRouter rate limit**
  - Solution: Add credits to OpenRouter account
  - Check API key validity

- **Evaluation stuck in pending**
  - Solution: Check server logs
  - Verify OpenRouter API is responding

### File Upload Issues
- **Upload fails**
  - Solution: Check storage bucket exists
  - Verify bucket policies in Supabase

- **Files not displaying**
  - Solution: Check file paths
  - Verify storage bucket is accessible

## Development Tips

### Running database migrations
```powershell
# If you make changes to schema.sql
# Apply them in Supabase SQL Editor
```

### Checking logs
```powershell
# View Next.js logs
npm run dev

# For production logs, check Vercel dashboard
```

### Testing authentication flow
1. Create test user in Supabase Authentication
2. Or use signup page to create new account
3. Verify email (if confirmations enabled)

### Resetting database
```sql
-- Run in Supabase SQL Editor to clear all data
TRUNCATE mains_evaluations CASCADE;
TRUNCATE prelims_sessions CASCADE;
TRUNCATE profiles CASCADE;
```

## Project Structure Explained

```
app/
├── auth/                   # Authentication pages
├── dashboard/              # Protected dashboard area
│   ├── mains/             # Mains evaluation pages
│   └── prelims/           # Prelims practice pages
├── api/                   # API routes (server-side)
lib/
├── supabase/              # Supabase client setup
types/                     # TypeScript definitions
supabase/
└── schema.sql            # Database schema
```

## Performance Optimization

### For development
- Use `npm run dev` with turbopack for faster builds
- Keep browser DevTools open for debugging

### For production
- Vercel automatically optimizes
- Images are optimized by Next.js
- API routes are edge functions

## Security Checklist

- [ ] Environment variables not committed to git
- [ ] RLS policies enabled on all tables
- [ ] Storage bucket set to private
- [ ] API routes check authentication
- [ ] CORS configured properly

## Getting Help

If you encounter issues:

1. Check this guide first
2. Review error messages carefully
3. Check Supabase logs
4. Check Vercel deployment logs
5. Verify all environment variables

## Next Steps

After successful setup:

1. Customize UI colors in `tailwind.config.ts`
2. Add more UPSC topics to prelims generator
3. Enhance evaluation criteria
4. Add analytics tracking
5. Implement user progress tracking

---

**Happy building! 🚀**
