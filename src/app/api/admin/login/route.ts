import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  hashCredentials,
} from "@/lib/admin-auth";
import { getClientIp, isRateLimited, recordAttempt, resetRateLimit } from "@/lib/rate-limit";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const rateLimitKey = `login:${getClientIp(request)}`;

    if (isRateLimited(rateLimitKey, MAX_ATTEMPTS, WINDOW_MS)) {
      return NextResponse.json(
        { error: "Terlalu banyak percobaan. Coba lagi dalam 15 menit." },
        { status: 429 }
      );
    }

    const { username, password } = await request.json();

    const isValid =
      username === process.env.ADMIN_USERNAME &&
      password === process.env.ADMIN_PASSWORD;

    if (!isValid) {
      recordAttempt(rateLimitKey, WINDOW_MS);
      return NextResponse.json(
        { error: "Username atau password salah" },
        { status: 401 }
      );
    }

    resetRateLimit(rateLimitKey);
    const sessionHash = await hashCredentials(username, password);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_SESSION_COOKIE, sessionHash, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: ADMIN_SESSION_MAX_AGE,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[POST /api/admin/login]", error);
    return NextResponse.json({ error: "Gagal login" }, { status: 500 });
  }
}
