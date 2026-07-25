"use client";

import { useQuery } from "@tanstack/react-query";
import { workspacesApi } from "@/lib/api";

export const workspaceKeys = {
  all: ["workspaces"] as const,
  list: () => [...workspaceKeys.all, "list"] as const,
};

export function useWorkspaces() {
  return useQuery({
    queryKey: workspaceKeys.list(),
    queryFn: () => workspacesApi.list(),
  });
}
