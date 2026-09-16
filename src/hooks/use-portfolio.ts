"use client";

import { useQuery } from "@tanstack/react-query";
import { portfolioApi } from "@/lib/api";

export const portfolioKeys = {
  all: ["portfolio"] as const,
  workspace: (workspaceId: string) =>
    [...portfolioKeys.all, workspaceId] as const,
};

export function usePortfolio(workspaceId: string | undefined) {
  return useQuery({
    queryKey: portfolioKeys.workspace(workspaceId ?? ""),
    queryFn: () => portfolioApi.get(workspaceId!),
    enabled: !!workspaceId,
  });
}
