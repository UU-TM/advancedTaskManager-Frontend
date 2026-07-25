import { NextResponse, type NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/api/client";
import { refreshCookieOptions, REFRESH_COOKIE_NAME } from "@/lib/auth/cookies";

/**
 * Logout route handler
 * ----------------------------------------------------
 * Forwards the Bearer access token to the backend so it
 * can invalidate the stored refresh hash, then clears
 * the local refresh cookie.
 */

export async function POST(req: NextRequest) {
  const authorization = req.headers.get("authorization");

  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        ...(authorization ? { Authorization: authorization } : {}),
      },
      cache: "no-store",
    });
  } catch {
    // Best-effort — still clear the cookie locally.
  }

  const res = NextResponse.json(
    { message: "Logged out", status: 200, data: { ok: true } },
    { status: 200 },
  );
  res.cookies.set(REFRESH_COOKIE_NAME, "", refreshCookieOptions(0));
  return res;
}
