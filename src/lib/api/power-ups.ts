import type { BoardPowerUp } from "@/types/domain";
import { apiFetch } from "./client";

export const powerUpsApi = {
  listByBoard(boardId: string): Promise<BoardPowerUp[]> {
    return apiFetch<BoardPowerUp[]>(`/boards/${boardId}/power-ups`);
  },

  enable(
    boardId: string,
    input: {
      packId: string;
      enabled?: boolean;
      config?: Record<string, unknown> | null;
    },
  ): Promise<BoardPowerUp> {
    return apiFetch<BoardPowerUp>(`/boards/${boardId}/power-ups`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  update(
    boardId: string,
    packId: string,
    input: { enabled?: boolean; config?: Record<string, unknown> | null },
  ): Promise<BoardPowerUp> {
    return apiFetch<BoardPowerUp>(`/boards/${boardId}/power-ups/${packId}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  disable(boardId: string, packId: string): Promise<BoardPowerUp> {
    return apiFetch<BoardPowerUp>(`/boards/${boardId}/power-ups/${packId}`, {
      method: "DELETE",
    });
  },

  enabledKeys(): Promise<{ keys: string[] }> {
    return apiFetch<{ keys: string[] }>("/me/power-ups");
  },
};
