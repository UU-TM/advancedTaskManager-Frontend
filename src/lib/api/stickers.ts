import type { CardSticker, StickerPack } from "@/types/domain";
import { apiFetch } from "./client";

export type PlaceStickerInput = {
  stickerId: string;
  x?: number;
  y?: number;
  rotate?: number;
  zIndex?: number;
};

export type UpdateCardStickerInput = Partial<
  Pick<CardSticker, "x" | "y" | "rotate" | "zIndex">
>;

export const stickersApi = {
  listPacks(): Promise<StickerPack[]> {
    return apiFetch<StickerPack[]>("/sticker-packs");
  },

  listForCard(cardId: string): Promise<CardSticker[]> {
    return apiFetch<CardSticker[]>(`/cards/${cardId}/stickers`);
  },

  place(cardId: string, input: PlaceStickerInput): Promise<CardSticker> {
    return apiFetch<CardSticker>(`/cards/${cardId}/stickers`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  update(id: string, input: UpdateCardStickerInput): Promise<CardSticker> {
    return apiFetch<CardSticker>(`/card-stickers/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  remove(id: string): Promise<CardSticker> {
    return apiFetch<CardSticker>(`/card-stickers/${id}`, { method: "DELETE" });
  },
};
