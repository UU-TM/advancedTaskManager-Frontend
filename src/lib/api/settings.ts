import type { User } from "@/types/domain";
import { apiFetch } from "./client";

export interface UserSettings {
  emailNotifications: boolean;
  activityDigests: boolean;
}

export interface UpdateProfileInput {
  displayName?: string | null;
  avatarUrl?: string | null;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export const settingsApi = {
  updateProfile(input: UpdateProfileInput): Promise<User> {
    return apiFetch<User>("/me/profile", {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  changePassword(input: ChangePasswordInput): Promise<{ ok: boolean }> {
    return apiFetch<{ ok: boolean }>("/me/password", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  getSettings(): Promise<UserSettings> {
    return apiFetch<UserSettings>("/me/settings");
  },

  updateSettings(input: Partial<UserSettings>): Promise<UserSettings> {
    return apiFetch<UserSettings>("/me/settings", {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },
};
