import { apiFetch } from "./client";

export type AnalyticsRange = "7d" | "30d" | "90d";

export type WorkspaceAnalytics = {
  throughputByWeek: { week: string; count: number }[];
  avgCycleTimeHours: number;
  wipCount: number;
  completedCount: number;
};

export const analyticsApi = {
  get(workspaceId: string, range: AnalyticsRange = "30d") {
    const params = new URLSearchParams({ range });
    return apiFetch<WorkspaceAnalytics>(
      `/workspaces/${workspaceId}/analytics?${params}`,
    );
  },
};
