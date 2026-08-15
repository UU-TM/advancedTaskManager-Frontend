import type { ActivityStats, SearchResult } from "@/types/domain";
import { apiFetch } from "./client";

export const activityStatsApi = {
  get(range: "weekly" | "daily"): Promise<ActivityStats> {
    return apiFetch<ActivityStats>(`/me/activity-stats?range=${range}`);
  },
};

export const searchApi = {
  search(q: string): Promise<SearchResult> {
    const params = new URLSearchParams({ q });
    return apiFetch<SearchResult>(`/me/search?${params.toString()}`);
  },
};
