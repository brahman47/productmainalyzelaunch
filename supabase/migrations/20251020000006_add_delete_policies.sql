-- Add DELETE policies for mains_evaluations and prelims_sessions
-- This allows users to delete their own evaluations and sessions

-- Delete policy for mains_evaluations
CREATE POLICY "mains_delete_policy" ON public.mains_evaluations
    FOR DELETE USING (
        auth.uid() = user_id 
        OR 
        public.is_current_user_admin()
    );

-- Delete policy for prelims_sessions
CREATE POLICY "prelims_delete_policy" ON public.prelims_sessions
    FOR DELETE USING (
        auth.uid() = user_id 
        OR 
        public.is_current_user_admin()
    );
