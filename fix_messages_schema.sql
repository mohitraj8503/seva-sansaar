-- Fix missing columns in messages table for Connectia
ALTER TABLE messages ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'sent';
ALTER TABLE messages ADD COLUMN IF NOT EXISTS seen BOOLEAN DEFAULT false;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS width INTEGER;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS height INTEGER;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS blur_hash TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS ciphertext TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS nonce TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_encrypted BOOLEAN DEFAULT false;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_by UUID[] DEFAULT '{}';

-- Refresh schema cache (Supabase specific)
NOTIFY pgrst, 'reload schema';
