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
import type { User } from "@/types/domain";
import {
  authApi,
  configureAuth,
  setAccessToken as setApiClientToken,
  type authApi as _authApiType,
} from "@/lib/api";
import { authStorage } from "./storage";
import {
  LOGIN_ROUTE,
  REFRESH_COOKIE_MAX_AGE,
  REFRESH_COOKIE_NAME,
} from "./config";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** Cached refresh promise — prevents concurrent refresh races. */
  refreshPromise: Promise<string | null> | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const refreshPromiseRef = useRef<Promise<string | null> | null>(null);

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
          return result.accessToken;
        }
        authStorage.clear();
        setUser(null);
        return null;
      } catch {
        authStorage.clear();
        setUser(null);
        return null;
      } finally {
        refreshPromiseRef.current = null;
      }
    })();

    refreshPromiseRef.current = promise;
    return promise;
  }, []);

  /** Wire the auth hooks into the API client so 401s auto-refresh. */
  useEffect(() => {
    configureAuth(refresh, () => {
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
          authStorage.clear();
          setUser(null);
        }
      }
      setIsLoading(false);
    })();

    return () => {
      unsub();
    };
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const session = await authApi.login({ email, password });
    setApiClientToken(session.tokens.accessToken);
    authStorage.setSession(session.tokens.accessToken, session.user);
    setUser(session.user);
  }, []);

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      const session = await authApi.register({
        username,
        email,
        password,
        confirmPassword: password,
      });
      setApiClientToken(session.tokens.accessToken);
      authStorage.setSession(session.tokens.accessToken, session.user);
      setUser(session.user);
    },
    [],
  );

  const logout = useCallback(async () => {
    await authApi.logout();
    setApiClientToken(null);
    authStorage.clear();
    setUser(null);
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
    }),
    [user, isLoading, login, register, logout, refresh],
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
