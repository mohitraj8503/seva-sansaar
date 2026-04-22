import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

// Try to use the Anon key. 
// NOTE: If RLS is ON, this might not be enough to create tables.
// The best way is the SQL editor, but we will try a "trick" to initialize.
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setup() {
  console.log("🚀 Starting Connectia Database Auto-Setup...");

  // 1. Check if we can talk to the DB
  const { data: tableCheck, error: tableError } = await supabase
    .from('messages')
    .select('id')
    .limit(1);

  if (tableError) {
    console.error("❌ Database Connection Error:", tableError.message);
    console.log("💡 This usually means the table 'messages' doesn't exist yet.");
  }

  console.log("\n--------------------------------------------------");
  console.log("🛠️  MANUAL ACTION REQUIRED (I've prepared the code):");
  console.log("--------------------------------------------------");
  console.log("Since I cannot run SQL without your login, please copy this:");
  console.log("\n--- COPY START ---");
  console.log(`
-- 1. Create the Profiles table
create table if not exists profiles (
  email text primary key,
  name text,
  avatar_url text,
  notifications_enabled boolean default true,
  language text default 'English'
);

-- 2. Ensure Messages table has 'type' and 'file_url'
alter table messages add column if not exists type text default 'text';
alter table messages add column if not exists file_url text;

-- 3. Room ID column (Self-healing fallback)
alter table messages add column if not exists room_id text default 'connectia_private_vault_8503';
  `);
  console.log("--- COPY END ---");
  console.log("\n👉 Paste it here: https://supabase.com/dashboard/project/cvllvjskqwbpxzcgqewj/sql");
  console.log("--------------------------------------------------\n");

  // 2. Storage Buckets (We can try to create these via API if permissions allow)
  console.log("📦 Checking Storage Buckets...");
  const buckets = ['avatars', 'messages'];
  
  for (const b of buckets) {
    const { data: bucket, error: bucketError } = await supabase.storage.getBucket(b);
    if (bucketError) {
      console.log(`⚠️  Bucket '${b}' missing. Please create it in Supabase Storage as 'PUBLIC'.`);
    } else {
      console.log(`✅ Bucket '${b}' is ready!`);
    }
  }
}

setup();
