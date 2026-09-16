import { apiFetch } from "./client";

export type ShareLink = {
  id: string;
  boardId: string;
  token: string;
  hasPassword: boolean;
  expiresAt: string | null;
  createdById: string;
  createdAt: string;
  revokedAt: string | null;
};

export type CreateShareLinkInput = {
  password?: string;
  expiresAt?: string;
};

export type PublicBoardCard = {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: string | null;
  position: number;
  coverColor: string | null;
  labels: { id: string; name: string; color: string }[];
};

export type PublicBoardColumn = {
  id: string;
  title: string;
  position: number;
  cards: PublicBoardCard[];
};

export type PublicBoardSnapshot = {
  id: string;
  name: string;
  columns: PublicBoardColumn[];
};

export const shareLinksApi = {
  list(boardId: string) {
    return apiFetch<ShareLink[]>(`/boards/${boardId}/share-links`);
  },

  create(boardId: string, input: CreateShareLinkInput = {}) {
    return apiFetch<ShareLink>(`/boards/${boardId}/share-links`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  revoke(boardId: string, linkId: string) {
    return apiFetch<ShareLink>(`/boards/${boardId}/share-links/${linkId}`, {
      method: "DELETE",
    });
  },

  getPublic(token: string, password?: string) {
    if (password) {
      return apiFetch<PublicBoardSnapshot>(`/public/boards/${token}`, {
        method: "POST",
        body: JSON.stringify({ password }),
        skipAuth: true,
        skipRefresh: true,
      });
    }
    return apiFetch<PublicBoardSnapshot>(`/public/boards/${token}`, {
      skipAuth: true,
      skipRefresh: true,
    });
  },
};

export const embedApi = {
  getBoard(token: string) {
    return apiFetch<PublicBoardSnapshot>(`/embed/boards/${token}`, {
      skipAuth: true,
      skipRefresh: true,
    });
  },
};
