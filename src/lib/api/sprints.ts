import { apiFetch } from "./client";

export type SprintStatus = "PLANNED" | "ACTIVE" | "CLOSED";

export type Sprint = {
  id: string;
  workspaceId: string;
  name: string;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  cardCount?: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateSprintInput = {
  name: string;
  startDate: string;
  endDate: string;
  status?: SprintStatus;
};

export type UpdateSprintInput = Partial<CreateSprintInput>;

export const sprintsApi = {
  list(workspaceId: string) {
    return apiFetch<Sprint[]>(`/workspaces/${workspaceId}/sprints`);
  },

  create(workspaceId: string, input: CreateSprintInput) {
    return apiFetch<Sprint>(`/workspaces/${workspaceId}/sprints`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  update(workspaceId: string, id: string, input: UpdateSprintInput) {
    return apiFetch<Sprint>(`/workspaces/${workspaceId}/sprints/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  activate(id: string) {
    return apiFetch<Sprint>(`/sprints/${id}/activate`, { method: "POST" });
  },

  close(id: string) {
    return apiFetch<Sprint>(`/sprints/${id}/close`, { method: "POST" });
  },

  assignCards(id: string, cardIds: string[]) {
    return apiFetch<{ updated: number }>(`/sprints/${id}/cards`, {
      method: "POST",
      body: JSON.stringify({ cardIds }),
    });
  },
};
