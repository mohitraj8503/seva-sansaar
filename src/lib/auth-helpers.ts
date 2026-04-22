/**
 * Auth helper – verifies Firebase ID token from the Authorization header.
 * Used by protected API routes.
 */
import { adminAuth } from '@/lib/firebase/admin';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { NextRequest } from 'next/server';

/**
 * Verify a Firebase ID token from the Authorization header.
 * Returns null if no token, invalid token, or token expired.
 * Logs errors for debugging in development.
 */
export async function verifyToken(req: NextRequest): Promise<DecodedIdToken | null> {
  try {
    const authHeader = req.headers.get('authorization') ?? '';
    if (!authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.slice(7);
    return await adminAuth.verifyIdToken(token);
  } catch (err) {
    // Log error class for debugging but don't expose details
    if (process.env.NODE_ENV === 'development') {
      console.warn('[verifyToken] Token verification failed:', (err as Error).message);
    }
    return null;
  }
}

/** Convenience: throw a 401 JSON response if not authenticated */
export async function requireAuth(req: NextRequest): Promise<DecodedIdToken> {
  const decoded = await verifyToken(req);
  if (!decoded) {
    throw new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    }) as never;
  }
  return decoded;
}

/**
 * Return a standardized 401 Unauthorized response.
 */
export function unauthorized(message = 'Unauthorized') {
  throw new Response(JSON.stringify({ error: message }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Return a standardized 403 Forbidden response.
 */
export function forbidden(message = 'Forbidden') {
  throw new Response(JSON.stringify({ error: message }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Return a standardized 400 Bad Request response.
 */
export function badRequest(message = 'Bad Request', details?: string) {
  const body = details ? { error: message, details } : { error: message };
  throw new Response(JSON.stringify(body), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  });
}
