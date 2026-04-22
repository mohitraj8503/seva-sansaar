/**
 * A4 – GET /api/businesses/[id]    — fetch single business
 *       PUT /api/businesses/[id]    — update business (admin only)
 *      DELETE /api/businesses/[id]  — delete business (admin only)
 */
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { requireAdminApi } from '@/lib/adminApiAuth';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limiter';
import { sanitizeText } from '@/lib/validation';
import type { Business } from '@/lib/types';

const SENSITIVE_FIELDS = ['passwordHash', 'ownerSecret', 'ownerEmail'] as const;

function stripSensitiveFields<T extends Record<string, unknown>>(obj: T): Omit<T, typeof SENSITIVE_FIELDS[number]> {
  const result = { ...obj };
  for (const key of SENSITIVE_FIELDS) {
    delete (result as Record<string, unknown>)[key];
  }
  return result;
}

// Explicit allowlist of fields that can be updated via PUT
const UPDATABLE_FIELDS = [
  'name',
  'category',
  'phone',
  'whatsapp',
  'address',
  'locality',
  'city',
  'hours',
  'pricing',
  'description',
  'services',
  'serviceAreas',
  'photoUrls',
] as const;

// ——— GET ——————————————————————————————————————————
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const ip = getClientIp(_req.headers);
    const limitResult = checkRateLimit(`businesses-get-id:${ip}`, RATE_LIMITS.DEFAULT.max, RATE_LIMITS.DEFAULT.windowMs);
    if (!limitResult.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { id } = await ctx.params;
    const sanitizedId = sanitizeText(id, 100);

    const doc = await adminDb.collection('businesses').doc(sanitizedId).get();
    if (!doc.exists) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }
    const data = doc.data() as Omit<Business, 'id'>;
    return NextResponse.json(stripSensitiveFields({ id: doc.id, ...data }));
  } catch (err) {
    console.error('[GET /api/businesses/[id]]', err);
    return NextResponse.json({ error: 'Failed to fetch business' }, { status: 500 });
  }
}

// ——— PUT ——————————————————————————————————————————
export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminApi(req);

    const ip = getClientIp(req.headers);
    const limitResult = checkRateLimit(`businesses-put:${ip}`, 20, 15 * 60 * 1000);
    if (!limitResult.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { id } = await ctx.params;
    const sanitizedId = sanitizeText(id, 100);

    // Verify business exists
    const doc = await adminDb.collection('businesses').doc(sanitizedId).get();
    if (!doc.exists) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const body = (await req.json()) as Record<string, unknown>;

    // Build update payload from allowlist only
    const updates: Record<string, unknown> = {};
    for (const field of UPDATABLE_FIELDS) {
      if (field in body) {
        if (Array.isArray(body[field])) {
          updates[field] = (body[field] as unknown[]).map((item: unknown) =>
            typeof item === 'string' ? sanitizeText(item, 500) : item
          );
        } else if (typeof body[field] === 'string') {
          updates[field] = sanitizeText(body[field] as string, 500);
        } else {
          updates[field] = body[field];
        }
      }
    }

    // Nothing to update
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const updatedAt = new Date().toISOString();
    await adminDb.collection('businesses').doc(sanitizedId).update({ ...updates, updatedAt });

    const updatedDoc = await adminDb.collection('businesses').doc(sanitizedId).get();
    return NextResponse.json(stripSensitiveFields({ id: sanitizedId, ...(updatedDoc.data() as Omit<Business, 'id'>) }));
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[PUT /api/businesses/[id]]', err);
    return NextResponse.json({ error: 'Failed to update business' }, { status: 500 });
  }
}

// ——— DELETE ——————————————————————————————————————
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminApi(req);

    const ip = getClientIp(req.headers);
    const limitResult = checkRateLimit(`businesses-delete:${ip}`, 10, 15 * 60 * 1000);
    if (!limitResult.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { id } = await ctx.params;
    const sanitizedId = sanitizeText(id, 100);

    const doc = await adminDb.collection('businesses').doc(sanitizedId).get();
    if (!doc.exists) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    await adminDb.collection('businesses').doc(sanitizedId).delete();
    return NextResponse.json({ message: 'Business deleted successfully' });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[DELETE /api/businesses/[id]]', err);
    return NextResponse.json({ error: 'Failed to delete business' }, { status: 500 });
  }
}
