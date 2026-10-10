"use client";

import { useQuery } from "@tanstack/react-query";
import { boardsApi } from "@/lib/api";

export const boardDashboardKeys = {
  byBoard: (boardId: string) => ["board", boardId, "dashboard"] as const,
};

export function useBoardDashboard(boardId: string | undefined) {
  return useQuery({
    queryKey: boardDashboardKeys.byBoard(boardId ?? ""),
    queryFn: () => boardsApi.getDashboard(boardId!),
    enabled: !!boardId,
    staleTime: 30_000,
  });
}
