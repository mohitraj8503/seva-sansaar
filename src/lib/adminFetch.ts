import { auth } from "./firebase/client";

/** 
 * Headers for admin dashboard API calls.
 * Dynamically retrieves the current Firebase user's ID token.
 */
export async function getAdminHeaders(): Promise<HeadersInit> {
  const user = auth.currentUser;
  if (!user) {
    console.warn("getAdminHeaders called without an authenticated user.");
    return {};
  }
  
  try {
    const token = await user.getIdToken();
    return { 
      "Authorization": `Bearer ${token}` 
    };
  } catch (err) {
    console.error("Failed to get admin headers:", err);
    return {};
  }
}

/** @deprecated Use getAdminHeaders() instead */
export function adminHeaders(): HeadersInit {
  return {};
}
