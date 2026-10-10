import type { BoardAutomation } from "@/types/domain";
import { apiFetch } from "./client";

export type CreateAutomationInput = Omit<
  BoardAutomation,
  "id" | "boardId" | "createdAt" | "updatedAt"
>;

export const automationsApi = {
  list(boardId: string): Promise<BoardAutomation[]> {
    return apiFetch<BoardAutomation[]>(`/boards/${boardId}/automations`);
  },

  create(
    boardId: string,
    input: CreateAutomationInput,
  ): Promise<BoardAutomation> {
    return apiFetch<BoardAutomation>(`/boards/${boardId}/automations`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  update(
    id: string,
    input: Partial<CreateAutomationInput>,
  ): Promise<BoardAutomation> {
    return apiFetch<BoardAutomation>(`/automations/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  run(
    id: string,
    input: { cardId?: string } = {},
  ): Promise<{ actionsRun: number }> {
    return apiFetch<{ actionsRun: number }>(`/automations/${id}/run`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  remove(id: string): Promise<BoardAutomation> {
    return apiFetch<BoardAutomation>(`/automations/${id}`, {
      method: "DELETE",
    });
  },
};
