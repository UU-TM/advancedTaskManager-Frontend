"use client";

import { useQuery } from "@tanstack/react-query";
import { activityStatsApi, searchApi } from "@/lib/api";

export const activityStatsKeys = {
  all: ["activity-stats"] as const,
  range: (range: "weekly" | "daily") =>
    [...activityStatsKeys.all, range] as const,
};

export function useActivityStats(range: "weekly" | "daily") {
  return useQuery({
    queryKey: activityStatsKeys.range(range),
    queryFn: () => activityStatsApi.get(range),
  });
}

export const searchKeys = {
  all: ["search"] as const,
  query: (q: string) => [...searchKeys.all, q] as const,
};

export function useSearch(q: string, enabled: boolean) {
  return useQuery({
    queryKey: searchKeys.query(q),
    queryFn: () => searchApi.search(q),
    enabled: enabled && q.trim().length > 0,
  });
}
