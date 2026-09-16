import { apiFetch } from "./client";

export type GoalStatus = "ON_TRACK" | "AT_RISK" | "DONE";

export type KeyResult = {
  id: string;
  goalId: string;
  title: string;
  targetNumber: number;
  currentNumber: number;
  linkedSprintId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Goal = {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  status: GoalStatus;
  keyResults?: KeyResult[];
  createdAt: string;
  updatedAt: string;
};

export type CreateGoalInput = {
  name: string;
  description?: string | null;
  status?: GoalStatus;
};

export type UpdateGoalInput = Partial<CreateGoalInput>;

export type CreateKeyResultInput = {
  title: string;
  targetNumber: number;
  currentNumber?: number;
  linkedSprintId?: string | null;
};

export type UpdateKeyResultInput = Partial<CreateKeyResultInput>;

export const goalsApi = {
  list(workspaceId: string) {
    return apiFetch<Goal[]>(`/workspaces/${workspaceId}/goals`);
  },

  create(workspaceId: string, input: CreateGoalInput) {
    return apiFetch<Goal>(`/workspaces/${workspaceId}/goals`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  update(id: string, input: UpdateGoalInput) {
    return apiFetch<Goal>(`/goals/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  remove(id: string) {
    return apiFetch<Goal>(`/goals/${id}`, { method: "DELETE" });
  },

  addKeyResult(goalId: string, input: CreateKeyResultInput) {
    return apiFetch<KeyResult>(`/goals/${goalId}/key-results`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  updateKeyResult(id: string, input: UpdateKeyResultInput) {
    return apiFetch<KeyResult>(`/key-results/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  removeKeyResult(id: string) {
    return apiFetch<KeyResult>(`/key-results/${id}`, { method: "DELETE" });
  },
};
