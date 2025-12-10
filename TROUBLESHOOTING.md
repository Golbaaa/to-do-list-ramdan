## 🔧 Troubleshooting: "Error fetching todos" Console Error

Jika Anda lihat error di console: **"Error fetching todos: 0"** saat mencoba add task, ini adalah masalah RLS (Row Level Security) policies di Supabase yang belum sepenuhnya setup.

---

## 📋 Diagnosis Steps

### Step 1: Check RLS Policies in Supabase

1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Anda
3. Klik **SQL Editor**
4. Jalankan debug query dari file `DEBUG_RLS.sql`:

```sql
-- 1. Check if RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'todos';

-- 2. Check all policies
SELECT * FROM pg_policies WHERE tablename = 'todos';

-- 3. Check table structure
SELECT column_name, data_type FROM information_schema.columns WHERE table_name='todos';

-- 4. Get your user ID
SELECT auth.uid();
```

### Step 2: Verify Column Exists

Make sure `user_id` column ada di table `todos`:

```sql
\d todos
```

Harus terlihat seperti:
```
Column    |         Type          
----------+------------------------
id        | uuid
title     | text
user_id   | uuid  ← HARUS ADA INI
is_complete | boolean
```

---

## 🛠️ Solutions

### Solution 1: Run Fresh Migration (RECOMMENDED)

Jika belum run migration sama sekali:

1. Buka **SQL Editor** di Supabase
2. **Delete existing todos table:**
```sql
DROP TABLE IF EXISTS todos CASCADE;
```

3. **Create table fresh with proper RLS:**
```sql
CREATE TABLE todos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  is_complete boolean DEFAULT false,
  category text,
  priority text,
  inserted_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Enable RLS
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own todos"
  ON todos FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own todos"
  ON todos FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own todos"
  ON todos FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own todos"
  ON todos FOR DELETE USING (auth.uid() = user_id);

-- Create index
CREATE INDEX todos_user_id_idx ON todos(user_id);
```

4. Run query
5. Test add task lagi

### Solution 2: Fix Existing Table

Jika sudah punya data dan tidak mau delete:

```sql
-- 1. Backup your data (opsional)
CREATE TABLE todos_backup AS SELECT * FROM todos;

-- 2. Add user_id if missing
ALTER TABLE todos ADD COLUMN IF NOT EXISTS user_id uuid;

-- 3. Set user_id untuk existing todos (PERINGATAN: ini assigns semua todos ke auth.uid() yang sedang active)
UPDATE todos SET user_id = auth.uid() WHERE user_id IS NULL;

-- 4. Make user_id NOT NULL
ALTER TABLE todos ALTER COLUMN user_id SET NOT NULL;

-- 5. Add foreign key
ALTER TABLE todos ADD CONSTRAINT todos_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 6. Drop old RLS policies
DROP POLICY IF EXISTS "Users can only see their own todos" ON todos;
DROP POLICY IF EXISTS "Users can only insert their own todos" ON todos;
DROP POLICY IF EXISTS "Users can only update their own todos" ON todos;
DROP POLICY IF EXISTS "Users can only delete their own todos" ON todos;

-- 7. Create new policies
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own todos"
  ON todos FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own todos"
  ON todos FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own todos"
  ON todos FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own todos"
  ON todos FOR DELETE USING (auth.uid() = user_id);

-- 8. Create index
CREATE INDEX IF NOT EXISTS todos_user_id_idx ON todos(user_id);
```

---

## 🔍 Testing After Fix

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Reload page** (F5)
3. **Open DevTools** (F12 → Console tab)
4. **Try to add task:**
   - Click "+ Add Task"
   - Enter task title
   - Click "Save"
5. **Check console:**
   - Should see: "Inserting todo: {title: '...', is_complete: false, user_id: 'xxx'}"
   - Should NOT see: "Error fetching todos"
6. **Task should appear** di list automatically

---

## ⚠️ Common Issues & Fixes

### Issue 1: "Error: new row violates row-level security policy"
**Cause:** RLS policy tidak allow INSERT dari your user
**Fix:** Make sure policy says `WITH CHECK (auth.uid() = user_id)`

### Issue 2: "Error: permission denied for schema public"
**Cause:** Supabase Auth tidak connected properly
**Fix:** Check if you're using correct Supabase URL & ANON KEY

### Issue 3: "relation 'todos' does not exist"
**Cause:** Table belum dibuat
**Fix:** Create table menggunakan solution di atas

### Issue 4: "column 'user_id' does not exist"
**Cause:** Migration tidak jalan
**Fix:** Add column manually dengan `ALTER TABLE todos ADD COLUMN user_id uuid`

---

## 📞 If Still Not Working

1. **Take a screenshot** dari console error (detail message)
2. **Check Supabase Dashboard → SQL Editor → Run:**
```sql
SELECT * FROM pg_policies WHERE tablename = 'todos';
```
3. **Verify output** - harus ada 4 policies
4. **Run manual test:**
```sql
SELECT auth.uid(); -- Check your current user ID
INSERT INTO todos (title, is_complete, user_id) 
VALUES ('Test', false, 'YOUR_USER_ID_HERE');
```

---

## 🚀 Prevention for Future

Untuk avoid masalah ini di future projects:

1. **Always create user_id column** saat create table
2. **Enable RLS** dari awal
3. **Create policies** sebelum Insert data
4. **Test dengan code** sebelum production

```typescript
// Good practice: Check error details
const { data, error } = await supabase.from('todos').insert(obj).select()
if (error) {
  console.error('Supabase error:', {
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint
  })
}
```

---

Semoga ini solve error Anda! 🎉

Kalau masih stuck, let me know dengan screenshot error message nya!
