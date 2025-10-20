// Script to apply the mentor guidance migration to remote Supabase
const SUPABASE_URL = 'https://prdesheccbrfpjczvsif.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByZGVzaGVjY2JyZnBqY3p2c2lmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MzQzODgsImV4cCI6MjA3NjQxMDM4OH0.lMp3uqNaJWl3DJphizN8gFFnVmksVY5IroyT6gPljss';

const migration = `
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

-- Drop existing policies if they exist
DROP POLICY IF EXISTS mentor_guidance_select_policy ON public.mains_mentor_guidance;
DROP POLICY IF EXISTS mentor_guidance_insert_policy ON public.mains_mentor_guidance;
DROP POLICY IF EXISTS mentor_guidance_admin_select_policy ON public.mains_mentor_guidance;

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
`;

async function applyMigration() {
  console.log('Applying mentor guidance migration...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ query: migration })
    });

    if (!response.ok) {
      // Try alternative method using postgrest
      console.log('First method failed, trying SQL execution via REST API...');
      
      const statements = migration.split(';').filter(s => s.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          console.log('Executing:', statement.substring(0, 50) + '...');
        }
      }
      
      console.log('\n⚠️  Note: You need to run this migration manually in Supabase Dashboard SQL Editor:');
      console.log('\n1. Go to https://supabase.com/dashboard/project/prdesheccbrfpjczvsif/sql');
      console.log('2. Copy the SQL from: supabase/migrations/20251020000009_add_mentor_guidance.sql');
      console.log('3. Paste and run it\n');
    } else {
      console.log('✅ Migration applied successfully!');
    }
  } catch (error) {
    console.error('Error applying migration:', error);
    console.log('\n⚠️  Please run the migration manually:');
    console.log('\n1. Go to https://supabase.com/dashboard/project/prdesheccbrfpjczvsif/sql');
    console.log('2. Copy the SQL from: supabase/migrations/20251020000009_add_mentor_guidance.sql');
    console.log('3. Paste and run it\n');
  }
}

applyMigration();
