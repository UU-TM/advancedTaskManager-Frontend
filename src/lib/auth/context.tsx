"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { User } from "@/types/domain";
import {
  authApi,
  configureAuth,
  setAccessToken as setApiClientToken,
} from "@/lib/api";
import { authStorage } from "./storage";
import {
  LOGIN_ROUTE,
  REFRESH_COOKIE_MAX_AGE,
  REFRESH_COOKIE_NAME,
} from "./config";
import { getJwtExpiryMs } from "./jwt";

/** Refresh this many ms before the access token expires. */
const REFRESH_SKEW_MS = 60_000;

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** Cached refresh promise — prevents concurrent refresh races. */
  refreshPromise: Promise<string | null> | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<string | null>;
  /** Re-fetch `/auth/me` and update session user (e.g. after profile edit). */
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const refreshPromiseRef = useRef<Promise<string | null> | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshRef = useRef<() => Promise<string | null>>(async () => null);

  const clearUserScopedCache = useCallback(() => {
    queryClient.clear();
  }, [queryClient]);

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current !== null) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  /**
   * Schedule a proactive refresh ~60s before the JWT expires.
   * Falls back to an immediate refresh if the token is already near expiry.
   */
  const scheduleRefresh = useCallback(
    (token: string) => {
      clearRefreshTimer();
      const expMs = getJwtExpiryMs(token);
      if (expMs === null) return;

      const delay = Math.max(expMs - Date.now() - REFRESH_SKEW_MS, 0);
      refreshTimerRef.current = setTimeout(() => {
        void refreshRef.current();
      }, delay);
    },
    [clearRefreshTimer],
  );

  /**
   * Refresh the access token by calling our own route handler.
   * The refresh cookie is sent automatically (httpOnly + SameSite).
   * We deduplicate concurrent calls so 401s on parallel requests
   * only trigger one refresh round-trip.
   */
  const refresh = useCallback(async (): Promise<string | null> => {
    if (refreshPromiseRef.current) return refreshPromiseRef.current;

    const promise = (async () => {
      try {
        const result = await authApi.refresh();
        if (result?.accessToken) {
          setApiClientToken(result.accessToken);
          scheduleRefresh(result.accessToken);
          return result.accessToken;
        }
        clearRefreshTimer();
        clearUserScopedCache();
        authStorage.clear();
        setUser(null);
        return null;
      } catch {
        clearRefreshTimer();
        clearUserScopedCache();
        authStorage.clear();
        setUser(null);
        return null;
      } finally {
        refreshPromiseRef.current = null;
      }
    })();

    refreshPromiseRef.current = promise;
    return promise;
  }, [clearRefreshTimer, clearUserScopedCache, scheduleRefresh]);

  refreshRef.current = refresh;

  /** Wire the auth hooks into the API client so 401s auto-refresh. */
  useEffect(() => {
    configureAuth(refresh, () => {
      clearRefreshTimer();
      clearUserScopedCache();
      authStorage.clear();
      setUser(null);
      if (typeof window !== "undefined") {
        window.location.assign(LOGIN_ROUTE);
      }
    });

    // Subscribe to the storage so external clears (logout, session
    // expiry) propagate to React state.
    const unsub = authStorage.subscribe((s) => {
      setUser(s.user);
    });

    // On first mount, try to silently refresh + fetch the user.
    (async () => {
      const token = await refresh();
      if (token) {
        try {
          const me = await authApi.me();
          authStorage.setSession(token, me);
          setUser(me);
        } catch {
          clearRefreshTimer();
          clearUserScopedCache();
          authStorage.clear();
          setUser(null);
        }
      }
      setIsLoading(false);
    })();

    return () => {
      unsub();
      clearRefreshTimer();
    };
  }, [refresh, clearRefreshTimer, clearUserScopedCache]);

  const login = useCallback(
    async (username: string, password: string) => {
      clearUserScopedCache();
      const session = await authApi.login({ username, password });
      setApiClientToken(session.tokens.accessToken);
      authStorage.setSession(session.tokens.accessToken, session.user);
      setUser(session.user);
      scheduleRefresh(session.tokens.accessToken);
    },
    [clearUserScopedCache, scheduleRefresh],
  );

  const register = useCallback(
    async (username: string, password: string) => {
      clearUserScopedCache();
      const session = await authApi.register({
        username,
        password,
        confirmPassword: password,
      });
      setApiClientToken(session.tokens.accessToken);
      authStorage.setSession(session.tokens.accessToken, session.user);
      setUser(session.user);
      scheduleRefresh(session.tokens.accessToken);
    },
    [clearUserScopedCache, scheduleRefresh],
  );

  const logout = useCallback(async () => {
    await authApi.logout();
    clearRefreshTimer();
    clearUserScopedCache();
    setApiClientToken(null);
    authStorage.clear();
    setUser(null);
  }, [clearRefreshTimer, clearUserScopedCache]);

  const refreshUser = useCallback(async (): Promise<User | null> => {
    try {
      const me = await authApi.me();
      authStorage.setUser(me);
      setUser(me);
      return me;
    } catch {
      return null;
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      refreshPromise: refreshPromiseRef.current,
      login,
      register,
      logout,
      refresh,
      refreshUser,
    }),
    [user, isLoading, login, register, logout, refresh, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside an <AuthProvider>");
  }
  return ctx;
}

// Re-export the cookie constants so the route handler can import from one place.
export { REFRESH_COOKIE_NAME, REFRESH_COOKIE_MAX_AGE };
