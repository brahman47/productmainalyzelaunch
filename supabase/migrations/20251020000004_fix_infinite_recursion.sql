-- Fix infinite recursion in RLS policies
-- The issue: policies check profiles table which has a policy that checks profiles table = infinite loop
-- Solution: Use a simpler admin check that doesn't create recursion

-- Drop all policies again
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "mains_select_policy" ON public.mains_evaluations;
DROP POLICY IF EXISTS "mains_insert_policy" ON public.mains_evaluations;
DROP POLICY IF EXISTS "prelims_select_policy" ON public.prelims_sessions;
DROP POLICY IF EXISTS "prelims_insert_policy" ON public.prelims_sessions;
DROP POLICY IF EXISTS "prelims_update_policy" ON public.prelims_sessions;

-- Create simple policies for PROFILES (no recursion)
CREATE POLICY "profiles_select_policy" ON public.profiles
    FOR SELECT USING (
        auth.uid() = id 
        OR 
        is_admin = TRUE  -- Simple check without subquery
    );

CREATE POLICY "profiles_update_policy" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- For other tables, we need to avoid the recursive subquery
-- Instead, we'll use a security definer function

-- Create a function to check if current user is admin (runs with elevated privileges)
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create policies using the function
CREATE POLICY "mains_select_policy" ON public.mains_evaluations
    FOR SELECT USING (
        auth.uid() = user_id 
        OR 
        public.is_current_user_admin()
    );

CREATE POLICY "mains_insert_policy" ON public.mains_evaluations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "prelims_select_policy" ON public.prelims_sessions
    FOR SELECT USING (
        auth.uid() = user_id 
        OR 
        public.is_current_user_admin()
    );

CREATE POLICY "prelims_insert_policy" ON public.prelims_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "prelims_update_policy" ON public.prelims_sessions
    FOR UPDATE USING (auth.uid() = user_id);
