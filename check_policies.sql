-- Check all current policies on the tables
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('profiles', 'mains_evaluations', 'prelims_sessions')
ORDER BY tablename, policyname;
