"use client";

import { useQuery } from "@tanstack/react-query";
import { workloadApi } from "@/lib/api";

export const workloadKeys = {
  all: ["workload"] as const,
  workspace: (workspaceId: string) =>
    [...workloadKeys.all, workspaceId] as const,
};

export function useWorkload(workspaceId: string | undefined) {
  return useQuery({
    queryKey: workloadKeys.workspace(workspaceId ?? ""),
    queryFn: () => workloadApi.get(workspaceId!),
    enabled: !!workspaceId,
  });
}
