"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reactionsApi } from "@/lib/api";
import { commentKeys } from "./use-kanban-extras";

export function useCommentReactions(cardId: string) {
  const qc = useQueryClient();

  const add = useMutation({
    mutationFn: ({ commentId, emoji }: { commentId: string; emoji: string }) =>
      reactionsApi.add(commentId, emoji),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: commentKeys.byCard(cardId) });
    },
  });

  const remove = useMutation({
    mutationFn: ({ commentId, emoji }: { commentId: string; emoji: string }) =>
      reactionsApi.remove(commentId, emoji),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: commentKeys.byCard(cardId) });
    },
  });

  return { add, remove };
}
