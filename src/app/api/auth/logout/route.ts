import { NextResponse, type NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/api/client";
import { REFRESH_COOKIE_NAME } from "@/lib/auth/config";

/**
 * Logout route handler
 * ----------------------------------------------------
 * Calls the backend `/auth/logout` endpoint (forwarding
 * the refresh cookie so it can be invalidated server-side)
 * and then clears the refresh cookie on the response.
 */

export async function POST(req: NextRequest) {
  const cookieHeader = req.headers.get("cookie") ?? "";

  try {
    // Best-effort: ignore backend errors so the client always signs out.
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });
  } catch {
    // ignore — we still clear the cookie locally
  }

  const res = NextResponse.json({ ok: true }, { status: 200 });
  res.cookies.set(REFRESH_COOKIE_NAME, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
    sameSite: "lax",
    secure: true,
  });
  return res;
}
