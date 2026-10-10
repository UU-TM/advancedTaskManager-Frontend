/**
 * Auth configuration
 * ----------------------------------------------------
 * Central place for protected-route allowlists and
 * redirect targets. The `proxy.ts` at the project
 * root reads `PROTECTED_PREFIXES` to decide when to
 * bounce unauthenticated users to `/login`.
 */

export const PROTECTED_PREFIXES = [
  "/home",
  "/boards",
  "/templates",
  "/integrations",
  "/workspace",
  "/invitations",
  "/settings",
  "/profile",
  "/my-work",
  "/analytics",
  "/workload",
  "/forms",
  "/inbox",
  "/sprints",
  "/goals",
  "/milestones",
  "/planning",
  "/portfolio",
  "/billing",
] as const;

export const PUBLIC_PREFIXES = [
  "/",
  "/login",
  "/register",
  "/dev",
  "/api/auth",
  "/public",
  "/embed",
] as const;

export const LOGIN_ROUTE = "/login";
/** Post-auth landing (and guest-redirect target). */
export const HOME_ROUTE = "/home";

/** Cookie name used by the refresh route handler. */
export const REFRESH_COOKIE_NAME = "kanban.refresh-token";

/** Cookie lifetime: 30 days. */
export const REFRESH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;
