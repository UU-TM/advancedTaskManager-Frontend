"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  stickersApi,
  type PlaceStickerInput,
  type UpdateCardStickerInput,
} from "@/lib/api";
import { cardKeys } from "./use-card";

export const stickerKeys = {
  packs: () => ["sticker-packs"] as const,
  byCard: (cardId: string) => ["card-stickers", cardId] as const,
};

export function useStickerPacks(enabled = true) {
  return useQuery({
    queryKey: stickerKeys.packs(),
    queryFn: () => stickersApi.listPacks(),
    enabled,
    staleTime: 5 * 60_000,
  });
}

export function useCardStickers(cardId: string | undefined) {
  return useQuery({
    queryKey: stickerKeys.byCard(cardId ?? ""),
    queryFn: () => stickersApi.listForCard(cardId!),
    enabled: !!cardId,
  });
}

export function useCardStickerMutations(cardId: string, columnId?: string) {
  const qc = useQueryClient();
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: stickerKeys.byCard(cardId) });
    void qc.invalidateQueries({ queryKey: cardKeys.detail(cardId) });
    if (columnId) {
      void qc.invalidateQueries({ queryKey: cardKeys.byColumn(columnId) });
    }
  };
  return {
    place: useMutation({
      mutationFn: (input: PlaceStickerInput) =>
        stickersApi.place(cardId, input),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, ...input }: { id: string } & UpdateCardStickerInput) =>
        stickersApi.update(id, input),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: string) => stickersApi.remove(id),
      onSuccess: invalidate,
    }),
  };
}
