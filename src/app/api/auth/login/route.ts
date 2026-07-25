import { NextResponse, type NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/api/client";
import {
  REFRESH_COOKIE_MAX_AGE,
  REFRESH_COOKIE_NAME,
} from "@/lib/auth/config";

/**
 * Login route handler (proxy)
 * ----------------------------------------------------
 * Forwards the login payload to the backend and, on
 * success, plants the refresh token in an httpOnly
 * cookie. Only the access token (short-lived) is
 * returned to the client as JSON.
 *
 * The client AuthProvider then loads the access token
 * into memory and uses it for subsequent API calls.
 */

interface BackendLoginEnvelope {
  message: string;
  status: number;
  data: {
    user: unknown;
    tokens: {
      accessToken: string;
      refreshToken?: string;
    };
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
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const text = await res.text();
    const envelope = text ? (JSON.parse(text) as BackendLoginEnvelope) : null;

    if (!res.ok || !envelope) {
      return NextResponse.json(
        { message: envelope?.message ?? "Login failed", status: res.status },
        { status: res.status },
      );
    }

    const { accessToken, refreshToken } = envelope.data.tokens;
    const response = NextResponse.json(
      {
        user: envelope.data.user,
        tokens: { accessToken },
      },
      { status: 200 },
    );

    if (refreshToken) {
      response.cookies.set(REFRESH_COOKIE_NAME, refreshToken, {
        httpOnly: true,
        path: "/",
        maxAge: REFRESH_COOKIE_MAX_AGE,
        sameSite: "lax",
        secure: true,
      });
    }

    return response;
  } catch {
    return NextResponse.json(
      { message: "Network error during login", status: 502 },
      { status: 502 },
    );
  }
}
