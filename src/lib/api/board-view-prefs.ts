import type { BoardViewPrefs, BoardViewMode } from "@/types/domain";
import { apiFetch } from "./client";

export const boardViewPrefsApi = {
  get(boardId: string): Promise<BoardViewPrefs> {
    return apiFetch<BoardViewPrefs>(`/boards/${boardId}/view-prefs`);
  },

  update(
    boardId: string,
    input: {
      viewMode?: BoardViewMode;
      filters?: Record<string, unknown> | null;
    },
  ): Promise<BoardViewPrefs> {
    return apiFetch<BoardViewPrefs>(`/boards/${boardId}/view-prefs`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },
};
