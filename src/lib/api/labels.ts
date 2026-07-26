import type { Label } from "@/types/domain";
import { apiFetch } from "./client";

export const labelsApi = {
  listByBoard(boardId: string) {
    return apiFetch<Label[]>(`/boards/${boardId}/labels`);
  },

  create(boardId: string, input: { name: string; color: string }) {
    return apiFetch<Label>(`/boards/${boardId}/labels`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  update(id: string, input: { name?: string; color?: string }) {
    return apiFetch<Label>(`/labels/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  remove(id: string) {
    return apiFetch<void>(`/labels/${id}`, { method: "DELETE" });
  },

  attachToCard(cardId: string, labelId: string) {
    return apiFetch<Label>(`/cards/${cardId}/labels/${labelId}`, {
      method: "POST",
    });
  },

  detachFromCard(cardId: string, labelId: string) {
    return apiFetch<void>(`/cards/${cardId}/labels/${labelId}`, {
      method: "DELETE",
    });
  },
};
