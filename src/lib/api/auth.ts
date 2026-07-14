import type { AuthSession, User } from "@/types/domain";
import type { LoginInput, RegisterInput } from "@/lib/validators/auth";
import { apiFetch } from "./client";

/**
 * Auth API module
 * ----------------------------------------------------
 * Endpoints are stubs that match the conventions in the
 * task brief. Adjust the URL paths to the actual backend
 * routes once they are finalized.
 *
 * The refresh + logout calls hit our own Next.js route
 * handlers (under `/api/auth/*`) which proxy to the
 * backend so the refresh token stays in an httpOnly
 * cookie and never reaches client-side JS.
 */

export type LoginResponse = AuthSession;
export type RegisterResponse = AuthSession;

export const authApi = {
  async login(input: LoginInput): Promise<LoginResponse> {
    return apiFetch<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
      skipAuth: true,
    });
  },

  async register(input: RegisterInput): Promise<RegisterResponse> {
    return apiFetch<RegisterResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
      skipAuth: true,
    });
  },

  /**
   * Refresh the access token. Calls our OWN route handler (relative URL)
   * so the httpOnly refresh cookie is sent automatically by the browser.
   * Returns a new access token — the refresh cookie is rotated server-side
   * and never exposed to JS.
   */
  async refresh(): Promise<{ accessToken: string } | null> {
    try {
      return await apiFetch<{ accessToken: string }>("/api/auth/refresh", {
        method: "POST",
        skipAuth: true,
        skipRefresh: true,
        relative: true,
      });
    } catch {
      return null;
    }
  },

  async logout(): Promise<void> {
    try {
      await apiFetch<void>("/api/auth/logout", {
        method: "POST",
        skipRefresh: true,
        relative: true,
      });
    } catch {
      // Even if the network call fails, the client has cleared its
      // in-memory token; the route handler already cleared the cookie.
    }
  },

  async me(): Promise<User> {
    return apiFetch<User>("/auth/me");
  },
};
