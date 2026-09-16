import { apiFetch } from "./client";

export type CardWatcher = {
  userId: string;
  username: string;
  displayName: string | null;
  createdAt: string;
};

export type CardWatchers = {
  cardId: string;
  watching: boolean;
  watchers: CardWatcher[];
};

export const watchersApi = {
  list(cardId: string) {
    return apiFetch<CardWatchers>(`/cards/${cardId}/watch`);
  },

  watch(cardId: string) {
    return apiFetch<CardWatchers>(`/cards/${cardId}/watch`, {
      method: "POST",
    });
  },

  unwatch(cardId: string) {
    return apiFetch<CardWatchers>(`/cards/${cardId}/watch`, {
      method: "DELETE",
    });
  },
};
