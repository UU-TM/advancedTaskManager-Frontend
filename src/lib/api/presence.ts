import { apiFetch } from "./client";

export type BoardPresenceUser = {
  userId: string;
  username: string;
  lastSeenAt: string;
};

export type BoardPresence = {
  presence: BoardPresenceUser[];
};

export const presenceApi = {
  heartbeat(boardId: string) {
    return apiFetch<BoardPresence>(`/boards/${boardId}/presence`, {
      method: "POST",
    });
  },

  list(boardId: string) {
    return apiFetch<BoardPresence>(`/boards/${boardId}/presence`);
  },
};
