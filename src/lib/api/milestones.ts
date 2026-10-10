import type { Milestone } from "@/types/domain";
import { apiFetch } from "./client";

export type CreateMilestoneInput = {
  name: string;
  dueDate?: string | null;
};

export type UpdateMilestoneInput = {
  name?: string;
  dueDate?: string | null;
};

export const milestonesApi = {
  list(workspaceId: string): Promise<Milestone[]> {
    return apiFetch<Milestone[]>(`/workspaces/${workspaceId}/milestones`);
  },

  create(workspaceId: string, input: CreateMilestoneInput): Promise<Milestone> {
    return apiFetch<Milestone>(`/workspaces/${workspaceId}/milestones`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  update(id: string, input: UpdateMilestoneInput): Promise<Milestone> {
    return apiFetch<Milestone>(`/milestones/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  remove(id: string): Promise<Milestone> {
    return apiFetch<Milestone>(`/milestones/${id}`, { method: "DELETE" });
  },

  linkCards(id: string, cardIds: string[]): Promise<Milestone> {
    return apiFetch<Milestone>(`/milestones/${id}/cards`, {
      method: "POST",
      body: JSON.stringify({ cardIds }),
    });
  },
};
