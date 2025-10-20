-- Create table for storing AI mentor guidance for action plan items
CREATE TABLE IF NOT EXISTS public.mains_mentor_guidance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id UUID NOT NULL REFERENCES public.mains_evaluations(id) ON DELETE CASCADE,
  action_item_index INTEGER NOT NULL,
  action_item_text TEXT NOT NULL,
  mentor_response TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(evaluation_id, action_item_index)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_mentor_guidance_evaluation_id ON public.mains_mentor_guidance(evaluation_id);

-- Enable RLS
ALTER TABLE public.mains_mentor_guidance ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own mentor guidance
CREATE POLICY mentor_guidance_select_policy ON public.mains_mentor_guidance
  FOR SELECT
  USING (
    evaluation_id IN (
      SELECT id FROM public.mains_evaluations 
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can insert mentor guidance for their own evaluations
CREATE POLICY mentor_guidance_insert_policy ON public.mains_mentor_guidance
  FOR INSERT
  WITH CHECK (
    evaluation_id IN (
      SELECT id FROM public.mains_evaluations 
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Admin can view all mentor guidance
CREATE POLICY mentor_guidance_admin_select_policy ON public.mains_mentor_guidance
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );
