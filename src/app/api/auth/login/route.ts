import { NextResponse, type NextRequest } from "next/server";
import { getServerApiBaseUrl } from "@/lib/api/client";
import { refreshCookieOptions, REFRESH_COOKIE_NAME } from "@/lib/auth/cookies";

/**
 * Login route handler (proxy)
 * ----------------------------------------------------
 * Forwards credentials to the backend and plants the
 * refresh token in an httpOnly cookie. Only the access
 * token is returned to the client.
 *
 * Backend login payload: `{ username, password }`
 * Backend data shape: `{ accessToken, refreshToken, user }`
 */

interface BackendLoginEnvelope {
  message: string;
  status: number;
  data: {
    accessToken: string;
    refreshToken: string;
    user: { id: string; username: string };
  };
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON body", status: 400 },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(`${getServerApiBaseUrl()}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const text = await res.text();
    const envelope = text ? (JSON.parse(text) as BackendLoginEnvelope) : null;

    if (!res.ok || !envelope?.data) {
      return NextResponse.json(
        {
          message: envelope?.message ?? "Login failed",
          status: res.status,
          data: null,
        },
        { status: res.status },
      );
    }

    const { accessToken, refreshToken, user } = envelope.data;
    const response = NextResponse.json(
      {
        message: envelope.message,
        status: 200,
        data: {
          user,
          tokens: { accessToken },
        },
      },
      { status: 200 },
    );

    if (refreshToken) {
      response.cookies.set(
        REFRESH_COOKIE_NAME,
        refreshToken,
        refreshCookieOptions(),
      );
    }

    return response;
  } catch {
    return NextResponse.json(
      { message: "Network error during login", status: 502, data: null },
      { status: 502 },
    );
  }
}
