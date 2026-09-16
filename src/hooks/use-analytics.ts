"use client";

import { useQuery } from "@tanstack/react-query";
import { analyticsApi, type AnalyticsRange } from "@/lib/api";

export const analyticsKeys = {
  all: ["analytics"] as const,
  workspace: (workspaceId: string, range: AnalyticsRange) =>
    [...analyticsKeys.all, workspaceId, range] as const,
};

export function useAnalytics(
  workspaceId: string | undefined,
  range: AnalyticsRange = "30d",
) {
  return useQuery({
    queryKey: analyticsKeys.workspace(workspaceId ?? "", range),
    queryFn: () => analyticsApi.get(workspaceId!, range),
    enabled: !!workspaceId,
  });
}
