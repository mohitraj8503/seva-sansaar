import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkConnection() {
  console.log("📡 Testing Supabase Connection...");
  console.log(`🔗 URL: ${supabaseUrl}`);

  // Test 1: Fetching something (Database Check)
  const { data, error } = await supabase.from('messages').select('count', { count: 'exact', head: true });

  if (error) {
    console.error("❌ Database Connection Failed!");
    console.error(`Error Details: ${error.message}`);
    
    if (error.message.includes("relation \"public.messages\" does not exist")) {
      console.log("💡 Tip: You haven't created the 'messages' table yet. Run the SQL script I provided earlier in your Supabase SQL Editor!");
    }
  } else {
    console.log("✅ Database Connection Successful!");
    console.log(`📊 Message Count: ${data === null ? 0 : data}`);
  }

  // Test 2: Checking for Auth
  const { data: authData, error: authError } = await supabase.auth.getSession();
  if (authError) {
    console.error("❌ Auth System Check Failed!");
  } else {
    console.log("✅ Auth System is Responsive!");
  }
}

checkConnection();
