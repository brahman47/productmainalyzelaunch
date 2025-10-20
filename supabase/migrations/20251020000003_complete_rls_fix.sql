-- Complete RLS policy reset and fix
-- This will ensure users can access their data and admins can access all data

-- First, disable RLS temporarily to ensure we can modify policies
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.mains_evaluations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.prelims_sessions DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users and admins can view profiles" ON public.profiles;

DROP POLICY IF EXISTS "Users can view own evaluations" ON public.mains_evaluations;
DROP POLICY IF EXISTS "Users can insert own evaluations" ON public.mains_evaluations;
DROP POLICY IF EXISTS "Admins can view all evaluations" ON public.mains_evaluations;
DROP POLICY IF EXISTS "Users and admins can view evaluations" ON public.mains_evaluations;

DROP POLICY IF EXISTS "Users can view own sessions" ON public.prelims_sessions;
DROP POLICY IF EXISTS "Users can insert own sessions" ON public.prelims_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON public.prelims_sessions;
DROP POLICY IF EXISTS "Admins can view all sessions" ON public.prelims_sessions;
DROP POLICY IF EXISTS "Users and admins can view sessions" ON public.prelims_sessions;

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mains_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prelims_sessions ENABLE ROW LEVEL SECURITY;

-- Create new policies for PROFILES
CREATE POLICY "profiles_select_policy" ON public.profiles
    FOR SELECT USING (
        auth.uid() = id 
        OR 
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.is_admin = TRUE
        )
    );

CREATE POLICY "profiles_update_policy" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Create new policies for MAINS_EVALUATIONS
CREATE POLICY "mains_select_policy" ON public.mains_evaluations
    FOR SELECT USING (
        auth.uid() = user_id 
        OR 
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.is_admin = TRUE
        )
    );

CREATE POLICY "mains_insert_policy" ON public.mains_evaluations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create new policies for PRELIMS_SESSIONS
CREATE POLICY "prelims_select_policy" ON public.prelims_sessions
    FOR SELECT USING (
        auth.uid() = user_id 
        OR 
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.is_admin = TRUE
        )
    );

CREATE POLICY "prelims_insert_policy" ON public.prelims_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "prelims_update_policy" ON public.prelims_sessions
    FOR UPDATE USING (auth.uid() = user_id);
