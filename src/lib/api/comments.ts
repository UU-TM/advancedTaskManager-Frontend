import type { Comment } from "@/types/domain";
import { apiFetch } from "./client";

export const commentsApi = {
  listByCard(cardId: string) {
    return apiFetch<Comment[]>(`/cards/${cardId}/comments`);
  },

  create(cardId: string, body: string) {
    return apiFetch<Comment>(`/cards/${cardId}/comments`, {
      method: "POST",
      body: JSON.stringify({ body }),
    });
  },

  update(id: string, body: string) {
    return apiFetch<Comment>(`/comments/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ body }),
    });
  },

  remove(id: string) {
    return apiFetch<void>(`/comments/${id}`, { method: "DELETE" });
  },
};
