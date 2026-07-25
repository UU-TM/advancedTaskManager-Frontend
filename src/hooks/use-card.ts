"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cardsApi } from "@/lib/api";

import type { CreateCardInput } from "@/lib/validators";

export const cardKeys = {
  all: ["cards"] as const,
  byColumn: (columnId: string) => [...cardKeys.all, "column", columnId] as const,
};

export function useCards(columnId: string | undefined) {
  return useQuery({
    queryKey: cardKeys.byColumn(columnId ?? ""),
    queryFn: () => cardsApi.listByColumn(columnId!),
    enabled: !!columnId,
  });
}

export function useCreateCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCardInput) => cardsApi.create(input),
    onSuccess: (_card, variables) => {
      void queryClient.invalidateQueries({
        queryKey: cardKeys.byColumn(variables.columnId),
      });
    },
  });
}