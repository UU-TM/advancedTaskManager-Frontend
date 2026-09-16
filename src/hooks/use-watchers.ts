"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { watchersApi } from "@/lib/api";

export const watcherKeys = {
  all: ["watchers"] as const,
  card: (cardId: string) => [...watcherKeys.all, cardId] as const,
};

export function useCardWatchers(cardId: string | undefined) {
  return useQuery({
    queryKey: watcherKeys.card(cardId ?? ""),
    queryFn: () => watchersApi.list(cardId!),
    enabled: !!cardId,
  });
}

export function useToggleWatch(cardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (watching: boolean) => {
      if (watching) return watchersApi.unwatch(cardId);
      return watchersApi.watch(cardId);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: watcherKeys.card(cardId) });
    },
  });
}
