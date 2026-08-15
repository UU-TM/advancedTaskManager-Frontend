"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { dashboardPrefsApi } from "@/lib/api";
import type { DashboardLayoutItem } from "@/types/domain";

export const dashboardPrefsKeys = {
  all: ["dashboard-prefs"] as const,
  current: (userId: string) =>
    [...dashboardPrefsKeys.all, "current", userId] as const,
};

export function useDashboardPrefs() {
  const { user, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: dashboardPrefsKeys.current(user?.id ?? ""),
    queryFn: () => dashboardPrefsApi.get(),
    enabled: isAuthenticated && !!user?.id,
  });
}

export function useUpdateDashboardPrefs() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const userId = user?.id ?? "";

  return useMutation({
    mutationFn: (layout: DashboardLayoutItem[]) =>
      dashboardPrefsApi.update(layout),
    onSuccess: (data) => {
      if (!userId) return;
      qc.setQueryData(dashboardPrefsKeys.current(userId), data);
    },
  });
}
