"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { boardsApi } from "@/lib/api";
import type { CreateColumnInput } from "@/lib/validators";

export const columnKeys = {
  all: ["columns"] as const,
  byBoard: (boardId: string) =>
    [...columnKeys.all, "board", boardId] as const,
};

export function useColumns(boardId: string | undefined) {
  return useQuery({
    queryKey: columnKeys.byBoard(boardId ?? ""),
    queryFn: () => boardsApi.listColumns(boardId!),
    enabled: !!boardId,
  });
}

export function useCreateColumn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateColumnInput ) => boardsApi.addColumn(input),
    onSuccess: (_board, variables) => {
      void queryClient.invalidateQueries({
        queryKey: columnKeys.byBoard(variables.boardId),
      });
    },
  });
}
