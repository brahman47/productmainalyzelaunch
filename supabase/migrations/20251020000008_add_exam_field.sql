-- Add exam_preparing_for field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS exam_preparing_for TEXT;

-- Update RLS policy to allow users to update their exam field
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
