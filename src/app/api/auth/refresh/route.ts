import { NextResponse, type NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/api/client";
import {
  REFRESH_COOKIE_MAX_AGE,
  REFRESH_COOKIE_NAME,
} from "@/lib/auth/config";

/**
 * Refresh route handler
 * ----------------------------------------------------
 * Forwards the httpOnly refresh cookie to the backend
 * `/auth/refresh` endpoint and returns the new access
 * token to the client as JSON. The refresh cookie is
 * rotated server-side (Set-Cookie in the response) and
 * never exposed to client-side JS.
 *
 * This is the ONLY endpoint that touches the refresh
 * token. The client's `authApi.refresh()` helper calls
 * this route (relative URL) so the cookie rides along
 * automatically.
 */

interface BackendRefreshEnvelope {
  message: string;
  status: number;
  data: {
    accessToken: string;
    refreshToken?: string;
  };
}

export async function POST(_req: NextRequest) {
  const cookieHeader = _req.headers.get("cookie") ?? "";

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: cookieHeader,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { message: "Refresh failed", status: res.status },
        { status: res.status },
      );
    }

    const envelope = (await res.json()) as BackendRefreshEnvelope;
    const next = NextResponse.json(
      { accessToken: envelope.data.accessToken },
      { status: 200 },
    );

    // If the backend rotated the refresh token, propagate the new cookie.
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) {
      next.headers.set("set-cookie", setCookie);
    } else if (envelope.data.refreshToken) {
      next.headers.append(
        "set-cookie",
        `${REFRESH_COOKIE_NAME}=${envelope.data.refreshToken}; HttpOnly; Path=/; Max-Age=${REFRESH_COOKIE_MAX_AGE}; SameSite=Lax; Secure`,
      );
    }

    return next;
  } catch {
    return NextResponse.json(
      { message: "Network error during refresh", status: 502 },
      { status: 502 },
    );
  }
}
