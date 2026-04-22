/**
 * Simple in-memory rate limiter for API routes.
 * Uses a sliding window algorithm with per-IP tracking.
 * In production, replace with Redis/Upstash for multi-server deployments.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
let cleanupInterval: ReturnType<typeof setInterval> | null = null;

function scheduleCleanup() {
  if (cleanupInterval) return;
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (entry.resetAt <= now) store.delete(key);
    }
    if (store.size === 0 && cleanupInterval) {
      clearInterval(cleanupInterval);
      cleanupInterval = null;
    }
  }, 5 * 60 * 1000);
}

/**
 * Check if a request is within rate limits.
 * @param key - Unique identifier (typically IP address)
 * @param maxRequests - Maximum requests allowed in the window
 * @param windowMs - Window duration in milliseconds
 * @returns `{ allowed: boolean; remaining: number; resetAt: number }`
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  scheduleCleanup();

  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}

/**
 * Get client IP from request headers, handling proxy scenarios.
 */
export function getClientIp(headers: Headers): string {
  // In production behind a proxy, use x-real-ip which is set by the reverse proxy
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp;

  // x-forwarded-for can be spoofed but is better than nothing
  // Only trust the last IP in the chain if behind known proxies
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const ips = forwarded.split(",").map((ip) => ip.trim());
    // Use the first IP (original client) rather than the last (most recent proxy)
    return ips[0] ?? "unknown";
  }

  return "unknown";
}

/**
 * Rate limit configuration presets.
 */
export const RATE_LIMITS = {
  // Auth endpoints: strict
  AUTH_LOGIN: { max: 10, windowMs: 15 * 60 * 1000 }, // 10 per 15 min
  // Booking: moderate
  BOOKING_CREATE: { max: 20, windowMs: 10 * 60 * 1000 }, // 20 per 10 min
  // Reviews: moderate
  REVIEW_CREATE: { max: 15, windowMs: 10 * 60 * 1000 }, // 15 per 10 min
  // SevaBot: strict (OpenAI costs)
  SEVABOT: { max: 30, windowMs: 60 * 60 * 1000 }, // 30 per hour
  // General API: lenient
  DEFAULT: { max: 100, windowMs: 15 * 60 * 1000 }, // 100 per 15 min
  // Image upload: strict
  IMAGE_UPLOAD: { max: 20, windowMs: 60 * 60 * 1000 }, // 20 per hour
  // Skills test: moderate
  SKILLS_TEST: { max: 10, windowMs: 60 * 60 * 1000 }, // 10 per hour
  // Analytics: very lenient
  ANALYTICS: { max: 200, windowMs: 15 * 60 * 1000 }, // 200 per 15 min
} as const;
