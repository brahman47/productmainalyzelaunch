# Admin System Setup Guide

## Overview
The admin system allows `brahmanprabha@gmail.com` to access a special admin dashboard to view all registered users and their activity.

## What Was Set Up

### 1. Database Changes
- **Migration File**: `supabase/migrations/20251020000000_add_admin_role.sql`
- Added `is_admin` boolean column to `profiles` table
- Set `brahmanprabha@gmail.com` as admin automatically
- Created admin policies to allow viewing all data

### 2. Admin Authentication
- **File**: `lib/auth/admin.ts`
- Functions to check if a user is admin
- Middleware to protect admin routes

### 3. Admin API
- **File**: `app/api/admin/users/route.ts`
- Fetches all users with their stats:
  - User ID, email, name
  - Number of mains evaluations
  - Number of prelims sessions
  - Join date
  - Admin status

### 4. Admin Dashboard
- **File**: `app/admin/page.tsx`
- Clean, professional admin interface
- Shows:
  - Total users count
  - Total evaluations count
  - Total practice sessions count
  - Searchable user table with all details
  - Real-time filtering

### 5. Navigation Update
- Added "Admin Dashboard" link in user menu (only visible to admins)
- Automatic redirect if non-admin tries to access `/admin`

## How to Use

### For You (Admin):
1. **Login**: Use your existing account `brahmanprabha@gmail.com`
2. **Access Admin**: Click your avatar → "Admin Dashboard"
3. **View Users**: See all registered users and their activity
4. **Search**: Filter users by email, name, or ID

### Setting Up in Supabase:
1. **Run Migration**:
   ```bash
   # In your terminal
   npx supabase db push
   ```
   OR manually run the SQL in Supabase Dashboard:
   - Go to Supabase Dashboard → SQL Editor
   - Copy contents of `supabase/migrations/20251020000000_add_admin_role.sql`
   - Execute the query

2. **Verify Admin Status**:
   - Go to Supabase Dashboard → Table Editor → `profiles`
   - Find your email `brahmanprabha@gmail.com`
   - Check that `is_admin` column is `true`

### Making Other Users Admin (if needed):
```sql
UPDATE public.profiles 
SET is_admin = TRUE 
WHERE email = 'another-email@example.com';
```

## Security Features
- ✅ Admin-only routes protected by middleware
- ✅ Row Level Security policies in database
- ✅ API endpoints verify admin status before returning data
- ✅ Non-admins automatically redirected if they try to access `/admin`
- ✅ Admin status checked on both client and server side

## Admin Dashboard Features
- 📊 **Statistics**: Total users, evaluations, and sessions
- 👥 **User Table**: All user details in one place
- 🔍 **Search**: Quickly find users by any field
- 🎨 **Clean Design**: Matches your app's Firebringer Labs aesthetic
- 🔒 **Secure**: Only accessible by admin accounts

## URLs
- Admin Dashboard: `https://yourdomain.com/admin`
- Admin API: `https://yourdomain.com/api/admin/users`

## Notes
- Your existing account will have admin access after running the migration
- Regular users won't see the admin menu option
- Admin access is permanent unless manually changed in database
- All admin actions are logged through Supabase
