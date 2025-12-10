-- Run this in Supabase SQL Editor to update the todos table

-- 1. Add user_id column if it doesn't exist
ALTER TABLE todos
ADD COLUMN IF NOT EXISTS user_id UUID DEFAULT auth.uid();

-- 2. Update any NULL user_id values to the authenticated user (if needed)
-- This step helps with existing data
UPDATE todos
SET user_id = auth.uid()
WHERE user_id IS NULL AND auth.uid() IS NOT NULL;

-- 3. Make user_id NOT NULL after updating
ALTER TABLE todos
ALTER COLUMN user_id SET NOT NULL;

-- 4. Add foreign key constraint to auth.users (drop if exists first)
ALTER TABLE todos
DROP CONSTRAINT IF EXISTS todos_user_id_fkey;

ALTER TABLE todos
ADD CONSTRAINT todos_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 5. Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS todos_user_id_idx ON todos(user_id);

-- 6. Add RLS (Row Level Security) policy to protect data
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can only see their own todos" ON todos;
DROP POLICY IF EXISTS "Users can only insert their own todos" ON todos;
DROP POLICY IF EXISTS "Users can only update their own todos" ON todos;
DROP POLICY IF EXISTS "Users can only delete their own todos" ON todos;

-- Create new policies
CREATE POLICY "Users can only see their own todos"
  ON todos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own todos"
  ON todos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own todos"
  ON todos FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own todos"
  ON todos FOR DELETE
  USING (auth.uid() = user_id);
