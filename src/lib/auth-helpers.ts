/**
 * Auth helper – verifies Firebase ID token from the Authorization header.
 * Used by protected API routes.
 */

import { adminAuth } from "@/lib/firebase/admin";
import { NextRequest } from "next/server";

type DecodedIdToken = ReturnType<
  typeof adminAuth.verifyIdToken
> extends Promise<infer T>
  ? T
  : never;

/**
 * Verify a Firebase ID token from the Authorization header.
 *
 * Returns null if:
 * - no token is provided
 * - token is invalid
 * - token is expired
 */
export async function verifyToken(
  req: NextRequest
): Promise<DecodedIdToken | null> {
  try {
    const authHeader = req.headers.get("authorization") ?? "";

    if (!authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
      return null;
    }

    return await adminAuth.verifyIdToken(token);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      const message =
        error instanceof Error ? error.message : "Unknown error";

      console.warn(
        "[verifyToken] Token verification failed:",
        message
      );
    }

    return null;
  }
}

/**
 * Require authentication.
 *
 * Throws a 401 response when the user is not authenticated.
 */
export async function requireAuth(
  req: NextRequest
): Promise<DecodedIdToken> {
  const decoded = await verifyToken(req);

  if (!decoded) {
    throw new Response(
      JSON.stringify({
        error: "Unauthorized",
      }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  return decoded;
}

/**
 * Return a standardized 401 Unauthorized response.
 */
export function unauthorized(message = "Unauthorized"): never {
  throw new Response(
    JSON.stringify({
      error: message,
    }),
    {
      status: 401,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

/**
 * Return a standardized 403 Forbidden response.
 */
export function forbidden(message = "Forbidden"): never {
  throw new Response(
    JSON.stringify({
      error: message,
    }),
    {
      status: 403,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

/**
 * Return a standardized 400 Bad Request response.
 */
export function badRequest(
  message = "Bad Request",
  details?: string
): never {
  const body = details
    ? {
        error: message,
        details,
      }
    : {
        error: message,
      };

  throw new Response(JSON.stringify(body), {
    status: 400,
    headers: {
      "Content-Type": "application/json",
    },
  });
}