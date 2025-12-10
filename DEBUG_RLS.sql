-- DEBUG: Check RLS Policies Status

-- 1. Check if RLS is enabled on todos table
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'todos';

-- 2. Check all policies on todos table
SELECT * FROM pg_policies WHERE tablename = 'todos';

-- 3. Check todos table structure
\d todos

-- 4. Check if user_id column exists
SELECT column_name, data_type FROM information_schema.columns WHERE table_name='todos';

-- 5. Test: Try to insert with your user ID (replace UUID with your actual user_id from auth)
-- Run this after updating the UUID
INSERT INTO todos (title, is_complete, user_id, category, priority)
VALUES ('Test Task', false, 'YOUR_USER_ID_HERE', NULL, NULL)
RETURNING *;

-- 6. Check if auth.uid() function works
SELECT auth.uid();

-- 7. List all users
SELECT id, email FROM auth.users;
