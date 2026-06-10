/**
 * Rate limiting بسيط in-memory (fixed window) — يكفي لعملية Node واحدة.
 * في الإنتاج الموزّع: استخدم Cloudflare Rate Limiting Rules (الطبقة الأولى)
 * أو Redis (مثل @upstash/ratelimit).
 */

const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit = 10, windowMs = 60_000): boolean {
  const now = Date.now();

  // تنظيف دوري خفيف عشان الـ Map متكبرش
  if (buckets.size > 10_000) {
    for (const [k, v] of buckets) if (v.resetAt < now) buckets.delete(k);
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count++;
  return true;
}

/** استخراج IP العميل (خلف Cloudflare بيبقى في CF-Connecting-IP) */
export function clientIp(req: Request): string {
  return (
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}
