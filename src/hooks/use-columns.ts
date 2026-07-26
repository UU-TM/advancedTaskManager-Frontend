"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { boardsApi } from "@/lib/api";
import type {
  CreateColumnInput,
  UpdateColumnInput,
  MoveColumnInput,
} from "@/lib/validators";
import type { BoardColumn } from "@/types/domain";

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
    mutationFn: (input: CreateColumnInput) => boardsApi.addColumn(input),
    onSuccess: (_col, variables) => {
      void queryClient.invalidateQueries({
        queryKey: columnKeys.byBoard(variables.boardId),
      });
    },
  });
}

export function useUpdateColumn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      boardId,
      input,
    }: {
      id: string;
      boardId: string;
      input: UpdateColumnInput;
    }) => boardsApi.updateColumn(id, input),
    onSuccess: (_col, { boardId }) => {
      void queryClient.invalidateQueries({
        queryKey: columnKeys.byBoard(boardId),
      });
    },
  });
}

export function useDeleteColumn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, boardId }: { id: string; boardId: string }) =>
      boardsApi.removeColumn(id).then(() => ({ id, boardId })),
    onSuccess: ({ boardId }) => {
      void queryClient.invalidateQueries({
        queryKey: columnKeys.byBoard(boardId),
      });
    },
  });
}

export function useArchiveColumn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; boardId: string }) =>
      boardsApi.archiveColumn(id),
    onSuccess: (_col, { boardId }) => {
      void queryClient.invalidateQueries({
        queryKey: columnKeys.byBoard(boardId),
      });
    },
  });
}

export function useMoveColumn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      boardId: string;
      input: MoveColumnInput;
    }) => boardsApi.moveColumn(id, input),
    onMutate: async ({ id, boardId, input }) => {
      await queryClient.cancelQueries({ queryKey: columnKeys.byBoard(boardId) });
      const prev = queryClient.getQueryData<BoardColumn[]>(
        columnKeys.byBoard(boardId),
      );
      if (!prev) return { prev };

      const cols = [...prev];
      const from = cols.findIndex((c) => c.id === id);
      if (from === -1) return { prev };
      const [moved] = cols.splice(from, 1);

      let insertAt = cols.length;
      if (input.beforeColumnId) {
        const i = cols.findIndex((c) => c.id === input.beforeColumnId);
        if (i !== -1) insertAt = i;
      } else if (input.afterColumnId) {
        const i = cols.findIndex((c) => c.id === input.afterColumnId);
        if (i !== -1) insertAt = i + 1;
      }
      cols.splice(insertAt, 0, moved);
      queryClient.setQueryData(columnKeys.byBoard(boardId), cols);
      return { prev };
    },
    onError: (_e, { boardId }, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(columnKeys.byBoard(boardId), ctx.prev);
      }
    },
    onSettled: (_d, _e, { boardId }) => {
      void queryClient.invalidateQueries({
        queryKey: columnKeys.byBoard(boardId),
      });
    },
  });
}
