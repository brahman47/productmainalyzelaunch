-- INSTRUCTIONS:
-- 1. Go to your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Select your project
-- 3. Click "SQL Editor" in the left sidebar
-- 4. Copy and paste the command below
-- 5. Click "Run" or press Ctrl+Enter

-- Set brahmanprabha@gmail.com as admin
UPDATE profiles 
SET is_admin = TRUE 
WHERE email = 'brahmanprabha@gmail.com';

-- Verify it worked (this will show your profile with is_admin = true)
SELECT id, email, is_admin, created_at 
FROM profiles 
WHERE email = 'brahmanprabha@gmail.com';
