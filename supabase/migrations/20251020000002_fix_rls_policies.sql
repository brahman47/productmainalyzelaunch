-- Fix RLS policies to allow both users to see their own data AND admins to see all data

-- Drop the conflicting admin policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all evaluations" ON public.mains_evaluations;
DROP POLICY IF EXISTS "Admins can view all sessions" ON public.prelims_sessions;

-- Drop existing user policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own evaluations" ON public.mains_evaluations;
DROP POLICY IF EXISTS "Users can view own sessions" ON public.prelims_sessions;

-- Create combined policies for profiles (users see own, admins see all)
CREATE POLICY "Users and admins can view profiles" ON public.profiles
    FOR SELECT USING (
        auth.uid() = id 
        OR 
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Create combined policies for mains evaluations (users see own, admins see all)
CREATE POLICY "Users and admins can view evaluations" ON public.mains_evaluations
    FOR SELECT USING (
        auth.uid() = user_id 
        OR 
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Create combined policies for prelims sessions (users see own, admins see all)
CREATE POLICY "Users and admins can view sessions" ON public.prelims_sessions
    FOR SELECT USING (
        auth.uid() = user_id 
        OR 
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );
