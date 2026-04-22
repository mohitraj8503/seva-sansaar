/**
 * A4 – GET /api/businesses  — list all (with optional category/city filter, pagination)
 *      POST /api/businesses — create new business (admin only)
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

// ——— GET ——————————————————————————————————————————
export async function GET(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const limitResult = checkRateLimit(`businesses-get:${ip}`, RATE_LIMITS.DEFAULT.max, RATE_LIMITS.DEFAULT.windowMs);
    if (!limitResult.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const locality = searchParams.get('locality');

    // Pagination
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    const limit = Math.min(parseInt(limitParam || '20', 10), 100);
    const offset = Math.max(parseInt(offsetParam || '0', 10), 0);

    let query: FirebaseFirestore.Query = adminDb.collection('businesses');

    if (category) query = query.where('category', '==', sanitizeText(category, 100));
    if (city) query = query.where('city', '==', sanitizeText(city, 100));
    if (locality) query = query.where('locality', '==', sanitizeText(locality, 100));

    const snapshot = await query.orderBy('createdAt', 'desc').offset(offset).limit(limit).get();

    const businesses = snapshot.docs.map((doc) => {
      const data = doc.data() as Omit<Business, 'id'>;
      return stripSensitiveFields({ id: doc.id, ...data });
    });

    // Get total count for pagination metadata
    const countSnapshot = await query.count().get();
    const total = countSnapshot.data().count;

    return NextResponse.json({
      businesses,
      pagination: { total, limit, offset, hasMore: offset + limit < total },
    });
  } catch (err) {
    console.error('[GET /api/businesses]', err);
    return NextResponse.json({ error: 'Failed to fetch businesses' }, { status: 500 });
  }
}

// ——— POST ——————————————————————————————————————————
export async function POST(req: NextRequest) {
  try {
    await requireAdminApi(req);

    const ip = getClientIp(req.headers);
    const limitResult = checkRateLimit(`businesses-post:${ip}`, 20, 15 * 60 * 1000);
    if (!limitResult.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = (await req.json()) as Record<string, unknown>;

    const now = new Date().toISOString();
    const docRef = await adminDb.collection('businesses').add({
      name: sanitizeText(String(body.name ?? ''), 200),
      category: sanitizeText(String(body.category ?? ''), 100),
      phone: sanitizeText(String(body.phone ?? ''), 20),
      whatsapp: sanitizeText(String(body.whatsapp ?? ''), 20),
      address: sanitizeText(String(body.address ?? ''), 500),
      locality: sanitizeText(String(body.locality ?? ''), 200),
      city: sanitizeText(String(body.city ?? ''), 100),
      hours: sanitizeText(String(body.hours ?? ''), 500),
      pricing: sanitizeText(String(body.pricing ?? ''), 500),
      description: sanitizeText(String(body.description ?? ''), 2000),
      services: Array.isArray(body.services) ? body.services.map((s: unknown) => sanitizeText(String(s), 200)) : [],
      serviceAreas: Array.isArray(body.serviceAreas) ? body.serviceAreas : [],
      photoUrls: Array.isArray(body.photoUrls) ? body.photoUrls : [],
      rating: 0,
      reviews: 0,
      verified: false,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    });

    const created = await docRef.get();
    const data = created.data();
    return NextResponse.json(stripSensitiveFields({ id: docRef.id, ...(data as Omit<Business, 'id'>) }), { status: 201 });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[POST /api/businesses]', err);
    return NextResponse.json({ error: 'Failed to create business' }, { status: 500 });
  }
}
