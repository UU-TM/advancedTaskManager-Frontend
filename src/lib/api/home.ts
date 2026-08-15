import type { Board, BoardStar, HomeDashboard } from "@/types/domain";
import { apiFetch } from "./client";

export const homeApi = {
  async get(): Promise<HomeDashboard> {
    return apiFetch<HomeDashboard>("/me/home");
  },

  async star(boardId: string): Promise<BoardStar> {
    return apiFetch<BoardStar>(`/boards/${boardId}/star`, { method: "POST" });
  },

  async unstar(boardId: string): Promise<void> {
    await apiFetch<void>(`/boards/${boardId}/star`, { method: "DELETE" });
  },

  async listStars(): Promise<Board[]> {
    return apiFetch<Board[]>("/me/stars");
  },
};
