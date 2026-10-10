import { apiFetch } from "./client";

export const exportApi = {
  workspace(workspaceId: string): Promise<unknown> {
    return apiFetch<unknown>(`/workspaces/${workspaceId}/export`);
  },
};
