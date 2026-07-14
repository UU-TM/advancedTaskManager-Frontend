/**
 * Auth configuration
 * ----------------------------------------------------
 * Central place for protected-route allowlists and
 * redirect targets. The `middleware.ts` at the project
 * root reads `PROTECTED_PREFIXES` to decide when to
 * bounce unauthenticated users to `/login`.
 */

export const PROTECTED_PREFIXES = [
  "/boards",
  "/workspace",
  "/settings",
  "/profile",
] as const;

export const PUBLIC_PREFIXES = [
  "/",
  "/login",
  "/register",
  "/dev",
  "/api/auth",
] as const;

export const LOGIN_ROUTE = "/login";
export const HOME_ROUTE = "/";

/** Cookie name used by the refresh route handler. */
export const REFRESH_COOKIE_NAME = "kanban.refresh-token";

/** Cookie lifetime: 30 days. */
export const REFRESH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;
