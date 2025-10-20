-- Fix admin ability to view all profiles
-- The issue: RLS policy prevents admin from seeing other users' profiles
-- Solution: Create a proper security definer function and use it correctly

-- Drop the problematic profile select policy
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;

-- The security definer function already exists from previous migration
-- We just need to use it correctly in the profiles policy

-- Create a new profile select policy that allows:
-- 1. Users to see their own profile
-- 2. Admins to see ALL profiles (using the security definer function)
CREATE POLICY "profiles_select_policy" ON public.profiles
    FOR SELECT USING (
        auth.uid() = id 
        OR 
        public.is_current_user_admin()
    );
