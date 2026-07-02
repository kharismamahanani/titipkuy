import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, hashCredentials } from "@/lib/admin-auth";

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/api/admin/login", "/api/admin/logout"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicPath = PUBLIC_ADMIN_PATHS.some((path) => pathname.startsWith(path));

  const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const expectedHash = await hashCredentials(
    process.env.ADMIN_USERNAME ?? "",
    process.env.ADMIN_PASSWORD ?? ""
  );
  const isAuthenticated = !!sessionCookie && sessionCookie === expectedHash;

  if (pathname === "/admin/login") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (isPublicPath) {
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
