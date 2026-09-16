"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { aiApi } from "@/lib/api";

export const aiKeys = {
  suggest: ["ai", "suggest"] as const,
};

export function useWorkSuggest(enabled = true) {
  return useQuery({
    queryKey: aiKeys.suggest,
    queryFn: () => aiApi.suggestNextWork(),
    enabled,
    staleTime: 60_000,
  });
}

export function useSummarizeBoard() {
  return useMutation({
    mutationFn: (boardId: string) => aiApi.summarizeBoard(boardId),
  });
}

export function useSummarizeCard() {
  return useMutation({
    mutationFn: (cardId: string) => aiApi.summarizeCard(cardId),
  });
}

export function useNlSearch() {
  return useMutation({
    mutationFn: (query: string) => aiApi.nlSearch(query),
  });
}
