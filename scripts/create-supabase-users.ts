import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const users = [
  {
    email: "mohitraj8503@gmail.com",
    password: "thistooshallpass",
  },
  {
    email: "rishika@me.com",
    password: "thistooshallpass",
  },
];

async function seedSupabaseUsers() {
  console.log("🚀 Seeding Supabase Users...");
  
  for (const user of users) {
    const { data, error } = await supabase.auth.signUp({
      email: user.email,
      password: user.password,
    });

    if (error) {
      if (error.message.includes("already registered")) {
        console.log(`ℹ️ User ${user.email} is already registered.`);
      } else {
        console.error(`❌ Error signing up ${user.email}:`, error.message);
      }
    } else {
      console.log(`✅ Successfully signed up ${user.email}. Check your email to confirm if needed!`);
    }
  }
  
  console.log("🏁 Done!");
}

seedSupabaseUsers();
