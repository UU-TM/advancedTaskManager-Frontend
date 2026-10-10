"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { boardsApi } from "@/lib/api";
import type { CreateBoardInput, UpdateBoardInput } from "@/lib/validators";
import type { Board } from "@/types/domain";

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

export const boardArchivedKey = (boardId: string) =>
  ["board", boardId, "archived"] as const;

/** Update board background / prefs (and optionally name). */
export function useUpdateBoardSettings(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateBoardInput) => boardsApi.update(boardId, input),
    onSuccess: (board) => {
      queryClient.setQueryData(["board", boardId], (prev: Board | undefined) =>
        prev ? { ...prev, ...board } : board,
      );
      void queryClient.invalidateQueries({ queryKey: ["board", boardId] });
      void queryClient.invalidateQueries({
        queryKey: boardKeys.byWorkspace(board.workspaceId),
      });
    },
  });
}

export function useBoardArchived(boardId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: boardArchivedKey(boardId ?? ""),
    queryFn: () => boardsApi.getArchived(boardId!),
    enabled: !!boardId && enabled,
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
