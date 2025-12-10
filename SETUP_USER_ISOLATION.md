## 🚀 Setup Database untuk User-Specific ToDo List

Setiap user harus punya to-do list mereka sendiri yang **terisolasi**. Untuk itu, ikuti langkah-langkah berikut:

### Step 1: Buka Supabase SQL Editor

1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Anda
3. Klik **SQL Editor** di sidebar kiri
4. Klik **New Query**

### Step 2: Run SQL Migration

Salin seluruh kode di bawah dan paste ke SQL Editor Supabase:

```sql
-- 1. Add user_id column if it doesn't exist
ALTER TABLE todos
ADD COLUMN IF NOT EXISTS user_id UUID NOT NULL DEFAULT auth.uid();

-- 2. Add foreign key constraint to auth.users
ALTER TABLE todos
ADD CONSTRAINT todos_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS todos_user_id_idx ON todos(user_id);

-- 4. Add RLS (Row Level Security) policy to protect data
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
```

### Step 3: Klik Run

Tekan tombol **RUN** atau gunakan keyboard shortcut **Ctrl+Enter**

### Step 4: Verifikasi

Jika berhasil, Anda akan melihat notifikasi hijau yang mengatakan query berhasil dijalankan.

---

## ✅ Yang Terjadi Setelah Setup

### Sebelum (Tanpa User Isolation):
- Semua user melihat semua to-do items
- Data tercampur

### Sesudah (Dengan User Isolation):
- ✅ Setiap user punya dashboard kosong saat pertama kali login
- ✅ To-do items hanya terlihat oleh user yang membuatnya
- ✅ Jika user baru register dan login, mereka lihat dashboard kosong
- ✅ Setiap user punya data mereka sendiri yang terisolasi

---

## 🔒 Bagaimana Ini Bekerja?

1. **user_id Column**: Setiap to-do item sekarang menyimpan ID user yang membuatnya
2. **Row Level Security (RLS)**: Database rule yang memastikan:
   - User hanya bisa **SELECT** to-do mereka sendiri
   - User hanya bisa **INSERT** to-do dengan user_id mereka
   - User hanya bisa **UPDATE** to-do mereka sendiri
   - User hanya bisa **DELETE** to-do mereka sendiri

3. **Foreign Key**: Jika user dihapus, semua to-do mereka otomatis terhapus

---

## 🧪 Testing

Setelah setup:

1. **User 1 Register & Login**
   - Akan melihat dashboard kosong ✓

2. **User 1 Buat To-Do**
   - Akan terlihat di dashboard User 1

3. **User 2 Register & Login**
   - Akan melihat dashboard kosong (bukan to-do User 1) ✓

4. **User 1 Login Lagi**
   - Hanya akan melihat to-do milik User 1

---

## ⚠️ Troubleshooting

### "Policy atau constraint sudah ada"
Tidak masalah, script sudah include `IF NOT EXISTS` dan `DROP POLICY IF EXISTS`

### "Column user_id sudah ada dengan value null"
Run manual fix:
```sql
UPDATE todos SET user_id = auth.uid() WHERE user_id IS NULL;
```

### Baru lihat to-do lama setelah setup
To-do lama mungkin tidak punya `user_id` yang valid. Anda bisa delete manual atau backup ke tempat lain dulu.

---

## 📝 Catatan Penting

- **RLS adalah security layer database**, bukan hanya di aplikasi
- Bahkan jika code ada bug, database akan proteksi data
- Semua query di code sudah ada `.eq('user_id', uid)` untuk tambahan safety

Selesai! 🎉
