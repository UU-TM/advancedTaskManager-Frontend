import type { Workspace } from "@/types/domain";
import type { CreateWorkspaceInput, UpdateWorkspaceInput } from "@/lib/validators";
import { apiFetch } from "./client";

/**
 * Workspaces API module
 * ----------------------------------------------------
 * `list` depends on `GET /workspaces` which the backend
 * has not shipped yet — see the coordination checklist
 * in the README. The signature is final; only the URL
 * may need adjusting once the route is implemented.
 */

export const workspacesApi = {
  async create(input: CreateWorkspaceInput): Promise<Workspace> {
    return apiFetch<Workspace>("/workspaces", {
      method: "POST",
      body: JSON.stringify(input),
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
