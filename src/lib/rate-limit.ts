// Rate limiter in-memory sederhana — cukup untuk skala kecil single-instance,
// bukan pengganti Redis untuk deployment multi-instance.

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

let callsSinceSweep = 0;

function sweepExpired() {
  callsSinceSweep += 1;
  if (callsSinceSweep < 200) return;
  callsSinceSweep = 0;

  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}

function getBucket(key: string, windowMs: number): Bucket {
  sweepExpired();

  const now = Date.now();
  const existing = buckets.get(key);
  if (existing && existing.resetAt > now) return existing;

  const fresh: Bucket = { count: 0, resetAt: now + windowMs };
  buckets.set(key, fresh);
  return fresh;
}

/**
 * Cek apakah `key` sudah melebihi `limit` dalam window saat ini.
 * Tidak menambah counter — panggil recordAttempt() terpisah untuk itu.
 * Return `null` jika belum kena limit, atau timestamp reset (ms) jika kena.
 */
export function isRateLimited(key: string, limit: number, windowMs: number): number | null {
  const bucket = getBucket(key, windowMs);
  return bucket.count >= limit ? bucket.resetAt : null;
}

/** Tambah satu percobaan ke counter `key`. */
export function recordAttempt(key: string, windowMs: number) {
  const bucket = getBucket(key, windowMs);
  bucket.count += 1;
}

/** Hapus counter `key`, mis. setelah login berhasil. */
export function resetRateLimit(key: string) {
  buckets.delete(key);
}

/** Ambil IP klien dari header (dukung proxy/load balancer di depan Next.js). */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}
