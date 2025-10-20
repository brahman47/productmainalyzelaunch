-- Add is_admin column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Set brahmanprabha@gmail.com as admin
UPDATE public.profiles 
SET is_admin = TRUE 
WHERE email = 'brahmanprabha@gmail.com';

-- Create admin policy to view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Create admin policy to view all mains evaluations
CREATE POLICY "Admins can view all evaluations" ON public.mains_evaluations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Create admin policy to view all prelims sessions
CREATE POLICY "Admins can view all sessions" ON public.prelims_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Create index on is_admin for performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin);
