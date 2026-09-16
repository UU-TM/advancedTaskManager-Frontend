import { NextResponse, type NextRequest } from "next/server";
import {
  PROTECTED_PREFIXES,
  PUBLIC_PREFIXES,
  LOGIN_ROUTE,
  REFRESH_COOKIE_NAME,
} from "@/lib/auth/config";

/**
 * Edge proxy (formerly `middleware`)
 * ----------------------------------------------------
 * Runs on every matched request. For protected prefixes
 * it checks for the refresh cookie and bounces to /login
 * when missing. We can't validate the access token here
 * (it lives only in memory on the client), so the cookie
 * is the canonical "has a session" signal at the edge.
 *
 * If the access token has expired, the AuthProvider will
 * silently refresh using this same cookie on the client.
 *
 * Next.js 16 renamed the `middleware.ts` convention to
 * `proxy.ts`; the export is now `proxy` instead of
 * `middleware`, but the API is otherwise identical.
 */

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

function isPublic(pathname: string): boolean {
  return PUBLIC_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow public paths through.
  if (isPublic(pathname)) return NextResponse.next();

  if (isProtected(pathname)) {
    const hasRefreshCookie = req.cookies.has(REFRESH_COOKIE_NAME);
    if (!hasRefreshCookie) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = LOGIN_ROUTE;
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Run on every path except Next internals and static assets.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.svg|robots.txt|manifest.webmanifest|sw.js|icons/).*)",
  ],
};
