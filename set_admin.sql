-- Manual admin setup script
-- Run this in Supabase SQL Editor to set brahmanprabha@gmail.com as admin

-- First, let's see if the profile exists
SELECT id, email, is_admin, created_at 
FROM profiles 
WHERE email = 'brahmanprabha@gmail.com';

-- If the profile exists, update it to admin
UPDATE profiles 
SET is_admin = TRUE 
WHERE email = 'brahmanprabha@gmail.com';

-- Verify it worked
SELECT id, email, is_admin, created_at 
FROM profiles 
WHERE email = 'brahmanprabha@gmail.com';
