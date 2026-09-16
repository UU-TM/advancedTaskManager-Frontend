import { apiFetch } from "./client";

export type CommentReaction = {
  id: string;
  commentId: string;
  userId: string;
  username: string;
  emoji: string;
  createdAt: string;
};

export const reactionsApi = {
  add(commentId: string, emoji: string) {
    return apiFetch<CommentReaction>(`/comments/${commentId}/reactions`, {
      method: "POST",
      body: JSON.stringify({ emoji }),
    });
  },

  remove(commentId: string, emoji: string) {
    const params = new URLSearchParams({ emoji });
    return apiFetch<CommentReaction>(
      `/comments/${commentId}/reactions?${params}`,
      { method: "DELETE" },
    );
  },
};
