import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// Initialize Firebase Admin
if (getApps().length === 0) {
  initializeApp();
}

const auth = getAuth();

const users = [
  {
    email: "mohitraj8503@gmail.com",
    password: "thistooshallpass",
    displayName: "Mohit Raj",
  },
  {
    email: "rishika@me.com",
    password: "thistooshallpass",
    displayName: "Rishika",
  },
];

async function createUsers() {
  console.log("🚀 Creating Connectia Users...");
  for (const user of users) {
    try {
      const userRecord = await auth.createUser({
        email: user.email,
        password: user.password,
        displayName: user.displayName,
      });
      console.log(`✅ Successfully created user: ${userRecord.email}`);
    } catch (error: any) {
      if (error.code === 'auth/email-already-exists') {
        console.log(`ℹ️ User ${user.email} already exists.`);
      } else {
        console.error(`❌ Error creating user ${user.email}:`, error.message);
      }
    }
  }
  console.log("🏁 Done!");
}

createUsers();
