import type { ActivityEvent } from "@/types/domain";
import { apiFetch } from "./client";

export const activityApi = {
  listByBoard(boardId: string) {
    return apiFetch<ActivityEvent[]>(`/boards/${boardId}/activity`);
  },

  listByCard(cardId: string) {
    return apiFetch<ActivityEvent[]>(`/cards/${cardId}/activity`);
  },
};
