import type { Workspace } from "@/types/domain";
import type { CreateWorkspaceInput, UpdateWorkspaceInput } from "@/lib/validators";
import { apiFetch } from "./client";

/**
 * Workspaces API module
 * ----------------------------------------------------
 * List: GET /workspaces (membership-scoped).
 * Create: POST /workspaces with `{ name }`.
 */

export const workspacesApi = {
  async create(input: CreateWorkspaceInput): Promise<Workspace> {
    return apiFetch<Workspace>("/workspaces", {
      method: "POST",
      body: JSON.stringify({ name: input.name }),
    });
  },

  async list(): Promise<Workspace[]> {
    return apiFetch<Workspace[]>("/workspaces");
  },

  async get(id: string): Promise<Workspace> {
    return apiFetch<Workspace>(`/workspaces/${id}`);
  },

  async update(id: string, input: UpdateWorkspaceInput): Promise<Workspace> {
    return apiFetch<Workspace>(`/workspaces/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  async remove(id: string): Promise<void> {
    await apiFetch<void>(`/workspaces/${id}`, { method: "DELETE" });
  },
};
