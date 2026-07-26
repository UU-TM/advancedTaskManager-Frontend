import type { ApiEnvelope, ApiErrorPayload } from "@/types/api";
import { ApiError, SessionExpiredError } from "./errors";

/** Function used to refresh the access token on 401. Set by the auth module. */
type RefreshFn = () => Promise<string | null>;

let refreshHandler: RefreshFn | null = null;
let onSessionExpired: (() => void) | null = null;

/** Auth module registers its refresh + redirect hooks here. */
export function configureAuth(
  refresh: RefreshFn,
  onExpired: () => void,
): void {
  refreshHandler = refresh;
  onSessionExpired = onExpired;
}

/** In-memory access token. Set by the auth context after login. */
let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

/**
 * Browser-facing API URL (`NEXT_PUBLIC_*`, inlined at build time).
 * Use for client fetches and any URL handed to the browser.
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

/**
 * Backend URL for server-side code (route handlers / SSR).
 * Prefer `API_URL` so Docker can reach the API on the host
 * (`http://host.docker.internal:3000`) without using container localhost.
 */
export function getServerApiBaseUrl(): string {
  return (
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:3000"
  );
}

function resolveApiBaseUrl(): string {
  return typeof window === "undefined"
    ? getServerApiBaseUrl()
    : API_BASE_URL;
}

/** Routes that should NOT trigger a refresh attempt. */
const PUBLIC_PATHS = ["/auth/login", "/auth/register", "/auth/refresh"];

function isPublicPath(url: string): boolean {
  return PUBLIC_PATHS.some((p) => url.includes(p));
}

interface FetchOptions extends RequestInit {
  /** Skip the auth header (used by login / register). */
  skipAuth?: boolean;
  /** Skip the automatic 401 → refresh retry. */
  skipRefresh?: boolean;
  /**
   * Treat `path` as a relative URL on this Next.js server (e.g. our own
   * route handlers under `/api/auth/*`). When true, `API_BASE_URL` is
   * NOT prepended. Useful for the refresh/logout proxies that must run
   * on the same origin so the httpOnly cookie is sent automatically.
   */
  relative?: boolean;
  /**
   * Next.js fetch cache behavior. Defaults to `no-store` for API calls.
   * Pass `'force-cache'` for GET endpoints that benefit from caching.
   */
  cache?: RequestCache;
  /** Next.js revalidation seconds (only honored for `force-cache`). */
  next?: { revalidate?: number; tags?: string[] };
}

/**
 * Low-level fetch wrapper that:
 *  1. prepends the backend base URL,
 *  2. injects the Authorization header (unless `skipAuth`),
 *  3. unwraps the `{ message, status, data }` envelope,
 *  4. on 401 (and not a public path), attempts a single refresh + retry,
 *  5. throws a typed `ApiError` for any non-2xx response.
 */
export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { skipAuth, skipRefresh, relative, headers, ...rest } = options;

  const finalHeaders = new Headers(headers);
  const isFormData =
    typeof FormData !== "undefined" && rest.body instanceof FormData;
  if (!finalHeaders.has("Content-Type") && rest.body && !isFormData) {
    finalHeaders.set("Content-Type", "application/json");
  }
  if (!skipAuth && accessToken && !finalHeaders.has("Authorization")) {
    finalHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  // Relative URLs (our own route handlers) bypass the API base so the
  // browser sends the httpOnly refresh cookie to the right origin.
  const url = relative
    ? path
    : path.startsWith("http")
      ? path
      : `${resolveApiBaseUrl()}${path}`;

  let res: Response;
  try {
    res = await fetch(url, {
      ...rest,
      headers: finalHeaders,
      cache: rest.cache ?? "no-store",
    });
  } catch (networkErr) {
    // Network-level failure (DNS, offline, CORS preflight, etc.).
    throw new ApiError(
      {
        message:
          "Network error — could not reach the API. Check your connection and try again.",
        status: 0,
        code: "NETWORK_ERROR",
      },
      networkErr,
    );
  }

  // 401 → try to refresh once, then retry the original request.
  if (res.status === 401 && !skipRefresh && !isPublicPath(path)) {
    const refreshed = refreshHandler ? await refreshHandler() : null;
    if (refreshed) {
      const retryHeaders = new Headers(finalHeaders);
      retryHeaders.set("Authorization", `Bearer ${refreshed}`);
      res = await fetch(url, { ...rest, headers: retryHeaders });
    } else {
      onSessionExpired?.();
      throw new SessionExpiredError();
    }
  }

  // Parse the envelope. The backend always returns JSON, even on errors.
  let envelope: ApiEnvelope<unknown> | null = null;
  const text = await res.text();
  if (text) {
    try {
      envelope = JSON.parse(text) as ApiEnvelope<unknown>;
    } catch {
      // Non-JSON body (e.g. 502 from a gateway) — synthesize an error.
      throw new ApiError(
        {
          message: `Unexpected response (status ${res.status}).`,
          status: res.status,
          code: "BAD_RESPONSE",
        },
        text,
      );
    }
  }

  if (!res.ok || !envelope) {
    const payload = (envelope ?? {}) as Partial<ApiEnvelope<unknown>> &
      ApiErrorPayload;
    throw new ApiError(
      {
        message: payload.message ?? `Request failed (${res.status}).`,
        status: payload.status ?? res.status,
        code: payload.code,
        details: payload.details,
      },
      envelope,
    );
  }

  return envelope.data as T;
}

/** Helper for JSON bodies. */
export function jsonBody<T>(body: T): string {
  return JSON.stringify(body);
}
