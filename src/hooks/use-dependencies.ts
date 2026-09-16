"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dependenciesApi } from "@/lib/api";

export const dependencyKeys = {
  all: ["dependencies"] as const,
  card: (cardId: string) => [...dependencyKeys.all, "card", cardId] as const,
  board: (boardId: string) =>
    [...dependencyKeys.all, "board", boardId] as const,
};

export function useCardDependencies(cardId?: string) {
  return useQuery({
    queryKey: dependencyKeys.card(cardId ?? ""),
    queryFn: () => dependenciesApi.listForCard(cardId!),
    enabled: !!cardId,
  });
}

export function useBoardDependencies(boardId?: string) {
  return useQuery({
    queryKey: dependencyKeys.board(boardId ?? ""),
    queryFn: () => dependenciesApi.listForBoard(boardId!),
    enabled: !!boardId,
  });
}

export function useCreateDependency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      blockerId,
      blockedId,
    }: {
      blockerId: string;
      blockedId: string;
    }) => dependenciesApi.create(blockerId, blockedId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: dependencyKeys.all });
      void qc.invalidateQueries({ queryKey: ["cards"] });
      void qc.invalidateQueries({ queryKey: ["columns"] });
    },
  });
}

export function useRemoveDependency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dependenciesApi.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: dependencyKeys.all });
      void qc.invalidateQueries({ queryKey: ["cards"] });
      void qc.invalidateQueries({ queryKey: ["columns"] });
    },
  });
}
