"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { boardsApi } from "@/lib/api";
import type { CreateBoardInput } from "@/lib/validators";

export const boardKeys = {
  all: ["boards"] as const,
  byWorkspace: (workspaceId: string) =>
    [...boardKeys.all, "workspace", workspaceId] as const,
};

export function useBoards(workspaceId: string | undefined) {
  return useQuery({
    queryKey: boardKeys.byWorkspace(workspaceId ?? ""),
    queryFn: () => boardsApi.listByWorkspace(workspaceId!),
    enabled: !!workspaceId,
  });
}

export function useCreateBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateBoardInput) => boardsApi.create(input),
    onSuccess: (_board, variables) => {
      void queryClient.invalidateQueries({
        queryKey: boardKeys.byWorkspace(variables.workspaceId),
      });
    },
  });
}
