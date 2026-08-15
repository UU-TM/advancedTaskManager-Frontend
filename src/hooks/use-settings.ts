"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsApi } from "@/lib/api";
import type {
  ChangePasswordInput,
  UpdateProfileInput,
  UserSettings,
} from "@/lib/api";

export const settingsKeys = {
  all: ["settings"] as const,
  me: () => [...settingsKeys.all, "me"] as const,
};

export function useUserSettings() {
  return useQuery({
    queryKey: settingsKeys.me(),
    queryFn: () => settingsApi.getSettings(),
  });
}

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (input: UpdateProfileInput) =>
      settingsApi.updateProfile(input),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: ChangePasswordInput) =>
      settingsApi.changePassword(input),
  });
}

export function useUpdateUserSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<UserSettings>) =>
      settingsApi.updateSettings(input),
    onSuccess: (data) => {
      qc.setQueryData(settingsKeys.me(), data);
    },
  });
}
