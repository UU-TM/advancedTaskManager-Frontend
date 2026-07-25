import type { AuthSession, User } from "@/types/domain";
import type { LoginInput, RegisterInput } from "@/lib/validators/auth";
import { apiFetch } from "./client";

/**
 * Auth API module
 * ----------------------------------------------------
 * Login / refresh / logout go through Next.js route
 * handlers so the refresh token stays in an httpOnly
 * cookie. Register hits the backend directly, then
 * signs in (backend register returns a user, not tokens).
 */

export type LoginResponse = AuthSession;
export type RegisterResponse = AuthSession;

export const authApi = {
  async login(input: LoginInput): Promise<LoginResponse> {
    return apiFetch<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
      skipAuth: true,
      relative: true,
    });
  },

  async register(input: RegisterInput): Promise<RegisterResponse> {
    await apiFetch<User>("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        username: input.username,
        password: input.password,
      }),
      skipAuth: true,
    });

    // Backend register returns the public user only — sign in next.
    return this.login({
      username: input.username,
      password: input.password,
    });
  },

  /**
   * Refresh the access token via our route handler so the
   * httpOnly refresh cookie is sent automatically.
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
      await apiFetch<{ ok: boolean }>("/api/auth/logout", {
        method: "POST",
        skipRefresh: true,
        relative: true,
      });
    } catch {
      // Client still clears its in-memory token.
    }
  },

  async me(): Promise<User> {
    return apiFetch<User>("/auth/me");
  },
};
