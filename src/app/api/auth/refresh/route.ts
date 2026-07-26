import { NextResponse, type NextRequest } from "next/server";
import { getServerApiBaseUrl } from "@/lib/api/client";
import { refreshCookieOptions, REFRESH_COOKIE_NAME } from "@/lib/auth/cookies";

/**
 * Refresh route handler
 * ----------------------------------------------------
 * Reads the httpOnly refresh cookie and posts it to the
 * backend as `{ refreshToken }` (JwtRefreshStrategy
 * extracts from the body). Returns a new access token
 * and rotates the cookie when the backend issues one.
 */

interface BackendRefreshEnvelope {
  message: string;
  status: number;
  data: {
    accessToken: string;
    refreshToken?: string;
  };
}

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get(REFRESH_COOKIE_NAME)?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { message: "No refresh token", status: 401, data: null },
      { status: 401 },
    );
  }

  try {
    const res = await fetch(`${getServerApiBaseUrl()}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });

    if (!res.ok) {
      const next = NextResponse.json(
        { message: "Refresh failed", status: res.status, data: null },
        { status: res.status },
      );
      next.cookies.set(REFRESH_COOKIE_NAME, "", refreshCookieOptions(0));
      return next;
    }

    const envelope = (await res.json()) as BackendRefreshEnvelope;
    const response = NextResponse.json(
      {
        message: envelope.message,
        status: 200,
        data: { accessToken: envelope.data.accessToken },
      },
      { status: 200 },
    );

    if (envelope.data.refreshToken) {
      response.cookies.set(
        REFRESH_COOKIE_NAME,
        envelope.data.refreshToken,
        refreshCookieOptions(),
      );
    }

    return response;
  } catch {
    return NextResponse.json(
      { message: "Network error during refresh", status: 502, data: null },
      { status: 502 },
    );
  }
}
