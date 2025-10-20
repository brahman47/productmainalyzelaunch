# 🚀 UPSC Prep Platform - Quick Reference

## ⚡ Quick Start (3 Steps)

### 1️⃣ Install Dependencies
```powershell
npm install
```

### 2️⃣ Configure Environment
Copy `.env.example` to `.env.local` and fill in:
- Supabase URL and Key (from supabase.com)
- OpenRouter API Key (from openrouter.ai)

### 3️⃣ Set Up Database
Run SQL from `supabase/schema.sql` in Supabase SQL Editor

### ▶️ Run Application
```powershell
npm run dev
```
Visit: http://localhost:3000

---

## 📋 Routes Overview

### Public Routes
- `/auth/login` - User login
- `/auth/signup` - New user registration

### Protected Routes (requires login)
- `/dashboard` - Main dashboard
- `/dashboard/mains` - Submit mains answers
- `/dashboard/mains/history` - View evaluations
- `/dashboard/prelims` - Generate MCQs
- `/dashboard/prelims/history` - Question bank

### API Routes
- `POST /api/evaluate-answer` - Evaluate mains answer
- `POST /api/generate-questions` - Generate prelims MCQs
- `POST /api/upload` - Upload files

---

## 🔧 Essential Commands

```powershell
# Development
npm run dev          # Start dev server

# Build
npm run build        # Build for production
npm start            # Start production server

# Linting
npm run lint         # Run ESLint
```

---

## 🗄️ Database Tables

### `profiles`
- User profile data
- Auto-created on signup

### `mains_evaluations`
- Question text
- Answer files URLs
- Evaluation results (JSON)
- Status: pending/completed/failed

### `prelims_sessions`
- Topic and difficulty
- Generated questions (JSON)
- User answers
- Score

### Storage: `answer-uploads`
- User-uploaded images/PDFs
- Private bucket

---

## 🎯 Key Features

### Mains Evaluation
✅ Upload images/PDF
✅ AI evaluation (async)
✅ Detailed feedback
✅ History tracking
✅ Real-time status updates

### Prelims Practice
✅ Topic selection
✅ Difficulty levels
✅ MCQ generation
✅ Instant feedback
✅ Question bank

---

## 🔑 Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
OPENROUTER_API_KEY=sk-or-v1-xxx...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 🐛 Common Issues & Fixes

### Issue: Build errors
```powershell
# Clear and reinstall
Remove-Item -Recurse -Force .next, node_modules
npm install
```

### Issue: Auth not working
- Check Supabase URL and keys
- Clear browser cookies
- Verify middleware.ts

### Issue: File upload fails
- Check storage bucket exists
- Verify bucket is named `answer-uploads`
- Check bucket policies

### Issue: AI evaluation stuck
- Verify OpenRouter API key
- Check API credits
- Review server logs

---

## 📊 Tech Stack at a Glance

| Component | Technology |
|-----------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| AI | Gemini 2.5 Flash (OpenRouter) |
| Deployment | Vercel |

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `middleware.ts` | Route protection |
| `lib/supabase/` | Supabase clients |
| `app/api/` | API endpoints |
| `supabase/schema.sql` | Database schema |
| `.env.local` | Environment config |
| `vercel.json` | Deployment config |

---

## 🎨 UI Components Structure

```
Dashboard
├── Stats Cards (Mains & Prelims counts)
├── Feature Cards (Quick actions)
└── Recent Activity Feed

Mains Evaluation
├── Question Input
├── File Upload (Drag & Drop)
└── Submit Button

Mains History
├── Evaluation List
├── Status Badges
└── Detail Modal

Prelims Generator
├── Topic Selector
├── Difficulty Selector
├── Question Count
└── Question Display

Prelims History
├── Session List
├── Question Cards
└── Detail Modal
```

---

## 🔐 Security Features

✅ Row Level Security (RLS)
✅ Protected API routes
✅ Secure file storage
✅ User data isolation
✅ Environment variables
✅ HTTPS required in production

---

## 📈 Next Steps After Setup

1. ✅ Test authentication flow
2. ✅ Submit a mains answer
3. ✅ Generate prelims questions
4. ✅ Customize UI/branding
5. ✅ Deploy to Vercel
6. ⚪ Add analytics (optional)
7. ⚪ Add email notifications (optional)
8. ⚪ Add more topics (optional)

---

## 🚀 Deployment Checklist

Before deploying to Vercel:

- [ ] Push code to GitHub
- [ ] Set environment variables in Vercel
- [ ] Update `NEXT_PUBLIC_SITE_URL`
- [ ] Add Vercel URL to Supabase redirect URLs
- [ ] Test authentication flow
- [ ] Test all features
- [ ] Monitor logs

---

## 📞 Support Resources

- 📖 Full documentation: `README.md`
- 🔧 Setup guide: `SETUP.md`
- 📊 Project summary: `PROJECT_SUMMARY.md`
- 🗄️ Database schema: `supabase/schema.sql`

---

## 💡 Pro Tips

1. Use VS Code for best experience
2. Install ESLint extension
3. Use browser DevTools for debugging
4. Check Supabase logs for database issues
5. Check Vercel logs for deployment issues
6. Test on mobile devices
7. Keep OpenRouter credits funded

---

**Happy Coding! 🎉**

For detailed information, refer to `SETUP.md` or `README.md`
