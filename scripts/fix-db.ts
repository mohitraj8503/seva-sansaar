import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

// Note: This script uses the anon key. If RLS is ON, it might fail.
// If it fails, I will guide the user to the SQL editor.
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function updateDatabase() {
  console.log("🚀 Attempting to update database structure...");
  
  // We can't easily run 'alter table' via the standard client without the service role key.
  // But we can test if the column exists by trying to insert a test message.
  
  const testMsg = {
    content: "System Check",
    sender_email: "system@connectia.com",
    room_id: "connectia_private_vault_8503",
    created_at: new Date().toISOString()
  };

  const { error } = await supabase.from('messages').insert([testMsg]);

  if (error) {
    if (error.message.includes("column \"room_id\" of relation \"messages\" does not exist")) {
      console.error("❌ ERROR: The 'room_id' column is missing.");
      console.log("💡 Please run the SQL I provided in your Supabase dashboard one last time!");
    } else {
      console.error("❌ Database Error:", error.message);
    }
  } else {
    console.log("✅ Database is UP-TO-DATE and Working!");
  }
}

updateDatabase();
