import * as admin from "firebase-admin";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
  /\\n/g,
  "\n"
);

if (!projectId || !clientEmail || !privateKey) {
  throw new Error(
    "Missing Firebase Admin credentials in .env.local"
  );
}

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

const auth = admin.auth();

const users = [
  {
    email: "mohitraj8503@gmail.com",
    displayName: "Mohit Raj",
    password: process.env.ADMIN_USER_PASSWORD,
  },
  {
    email: "rishika@me.com",
    displayName: "Rishika",
    password: process.env.RISHIKA_USER_PASSWORD,
  },
];

async function createUsers() {
  console.log("Creating Seva Sansaar users...");

  for (const user of users) {
    if (!user.password) {
      console.error(`Missing password for ${user.email}`);
      continue;
    }

    try {
      const existingUser = await auth.getUserByEmail(user.email);

      await auth.updateUser(existingUser.uid, {
        displayName: user.displayName,
        password: user.password,
      });

      console.log(`Updated: ${user.email}`);
    } catch (error: unknown) {
      const firebaseError = error as {
        code?: string;
        message?: string;
      };

      if (firebaseError.code === "auth/user-not-found") {
        const createdUser = await auth.createUser({
          email: user.email,
          password: user.password,
          displayName: user.displayName,
        });

        console.log(`Created: ${createdUser.email}`);
      } else {
        console.error(
          `Error for ${user.email}:`,
          firebaseError.message ?? error
        );
      }
    }
  }

  console.log("Done!");
}

createUsers().catch((error) => {
  console.error("User creation failed:", error);
  process.exit(1);
});