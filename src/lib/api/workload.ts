import { apiFetch } from "./client";

export type WorkloadAssignee = {
  userId: string;
  username: string;
  openCards: number;
  estimateMinutes: number;
  timeSpentMs: number;
};

/** Backend service returns a bare array (DTO file has a duplicate schema). */
export const workloadApi = {
  get(workspaceId: string) {
    return apiFetch<WorkloadAssignee[]>(
      `/workspaces/${workspaceId}/workload`,
    );
  },
};
