"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { boardsApi } from "@/lib/api";
import type { CreateBoardInput } from "@/lib/validators";

export const boardKeys = {
  all: ["boards"] as const,
  byWorkspace: (workspaceId: string) =>
    [...boardKeys.all, "workspace", workspaceId] as const,
};

export function useBoard(boardId: string | undefined) {
  return useQuery({
    queryKey: ["board", boardId ?? ""] as const,
    queryFn: () => boardsApi.get(boardId!),
    enabled: !!boardId,
  });
}

export function useUpdateBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      name,
      workspaceId,
    }: {
      id: string;
      name: string;
      workspaceId: string;
    }) => boardsApi.update(id, { name }),
    onSuccess: (_board, { id, workspaceId }) => {
      void queryClient.invalidateQueries({ queryKey: ["board", id] });
      void queryClient.invalidateQueries({
        queryKey: boardKeys.byWorkspace(workspaceId),
      });
    },
  });
}

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
