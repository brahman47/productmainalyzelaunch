-- Create table for storing personalized explanations for wrong answers in prelims
CREATE TABLE IF NOT EXISTS public.prelims_personalized_explanations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.prelims_sessions(id) ON DELETE CASCADE,
  question_index INTEGER NOT NULL,
  explanation TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, question_index)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_prelims_explanations_session_id ON public.prelims_personalized_explanations(session_id);

-- Enable RLS
ALTER TABLE public.prelims_personalized_explanations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own explanations
CREATE POLICY prelims_explanations_select_policy ON public.prelims_personalized_explanations
  FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM public.prelims_sessions 
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can insert explanations for their own sessions
CREATE POLICY prelims_explanations_insert_policy ON public.prelims_personalized_explanations
  FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM public.prelims_sessions 
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Admin can view all explanations
CREATE POLICY prelims_explanations_admin_select_policy ON public.prelims_personalized_explanations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );
