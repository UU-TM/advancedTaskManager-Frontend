"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { boardViewPrefsApi } from "@/lib/api";
import type { BoardViewMode } from "@/types/domain";

export const boardViewPrefsKeys = {
  all: ["board-view-prefs"] as const,
  board: (boardId: string) =>
    [...boardViewPrefsKeys.all, boardId] as const,
};

export function useBoardViewPrefs(boardId?: string) {
  return useQuery({
    queryKey: boardViewPrefsKeys.board(boardId ?? ""),
    queryFn: () => boardViewPrefsApi.get(boardId!),
    enabled: !!boardId,
  });
}

export function useUpdateBoardViewPrefs(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      viewMode?: BoardViewMode;
      filters?: Record<string, unknown> | null;
    }) => boardViewPrefsApi.update(boardId, input),
    onSuccess: (data) => {
      qc.setQueryData(boardViewPrefsKeys.board(boardId), data);
    },
  });
}
