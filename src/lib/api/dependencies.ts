import type { CardDependency } from "@/types/domain";
import { apiFetch } from "./client";

export const dependenciesApi = {
  listForCard(cardId: string): Promise<CardDependency[]> {
    return apiFetch<CardDependency[]>(`/cards/${cardId}/dependencies`);
  },

  listForBoard(boardId: string): Promise<CardDependency[]> {
    return apiFetch<CardDependency[]>(`/boards/${boardId}/dependencies`);
  },

  create(blockerId: string, blockedId: string): Promise<CardDependency> {
    return apiFetch<CardDependency>("/dependencies", {
      method: "POST",
      body: JSON.stringify({ blockerId, blockedId }),
    });
  },

  remove(id: string): Promise<CardDependency> {
    return apiFetch<CardDependency>(`/dependencies/${id}`, {
      method: "DELETE",
    });
  },
};
