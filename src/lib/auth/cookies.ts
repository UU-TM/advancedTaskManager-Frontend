import { REFRESH_COOKIE_MAX_AGE, REFRESH_COOKIE_NAME } from "./config";

/** Shared Set-Cookie options for the refresh token. */
export function refreshCookieOptions(maxAge = REFRESH_COOKIE_MAX_AGE) {
  return {
    httpOnly: true,
    path: "/",
    maxAge,
    sameSite: "lax" as const,
    // Local http://localhost cannot set Secure cookies.
    secure: process.env.NODE_ENV === "production",
  };
}

export { REFRESH_COOKIE_NAME };
