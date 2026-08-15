import type { User } from "@/types/domain";

/**
 * Auth token storage strategy
 * ----------------------------------------------------
 * Access token: kept in-memory only (never localStorage).
 *   It is lost on page reload — the route handler
 *   below uses the refresh cookie to obtain a new one
 *   before the first protected request fires.
 *
 * Refresh token: stored in an httpOnly, Secure, SameSite=Lax
 *   cookie set by our own Next.js route handler
 *   (`/api/auth/refresh`). The cookie is never readable
 *   from client-side JS, which mitigates XSS-driven
 *   token theft.
 *
 * Session state: this module exposes a tiny event-emitting
 *   store so the React context can subscribe without
 *   prop-drilling.
 */

const ACCESS_TOKEN_KEY = "kanban:access-token";
const USER_KEY = "kanban:user";

type Listener = (state: AuthStorageState) => void;

interface AuthStorageState {
  accessToken: string | null;
  user: User | null;
}

let state: AuthStorageState = {
  accessToken: null,
  user: null,
};

const listeners = new Set<Listener>();

function emit(): void {
  for (const l of listeners) l(state);
}

export const authStorage = {
  get state(): AuthStorageState {
    return state;
  },
  get accessToken(): string | null {
    return state.accessToken;
  },
  get user(): User | null {
    return state.user;
  },
  get isAuthenticated(): boolean {
    return !!state.accessToken && !!state.user;
  },

  setSession(accessToken: string, user: User): void {
    state = { accessToken, user };
    emit();
  },

  setUser(user: User | null): void {
    state = { ...state, user };
    emit();
  },

  clear(): void {
    state = { accessToken: null, user: null };
    emit();
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

/** Keys kept here only for documentation — values never touch localStorage. */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: ACCESS_TOKEN_KEY,
  USER: USER_KEY,
} as const;
