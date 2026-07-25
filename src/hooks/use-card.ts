"use client";

import { useQuery } from "@tanstack/react-query";
import { cardsApi } from "@/lib/api";

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