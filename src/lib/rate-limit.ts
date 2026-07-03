// Rate limiter berbasis Upstash Redis — persisten lintas instance
// serverless (Vercel), berbeda dengan Map in-memory yang counter-nya
// tidak tershare antar cold start/instance.

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const loginRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"), // 5x per 15 menit
  analytics: false,
  prefix: "titipkuy:login",
});

export const bookingRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 h"), // 3x per jam
  analytics: false,
  prefix: "titipkuy:booking",
});

/** Ambil IP klien dari header (dukung proxy/load balancer di depan Next.js). */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}
