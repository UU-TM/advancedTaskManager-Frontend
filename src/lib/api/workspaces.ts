import type {
  Workspace,
  WorkspaceMember,
  WorkspaceInvitation,
  WorkspaceRole,
} from "@/types/domain";
import type { CreateWorkspaceInput, UpdateWorkspaceInput } from "@/lib/validators";
import { apiFetch } from "./client";

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

  async remove(id: string): Promise<Workspace> {
    return apiFetch<Workspace>(`/workspaces/${id}`, { method: "DELETE" });
  },

  async listMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    return apiFetch<WorkspaceMember[]>(`/workspaces/${workspaceId}/members`);
  },

  async removeMember(workspaceId: string, userId: string): Promise<void> {
    await apiFetch<void>(`/workspaces/${workspaceId}/members/${userId}`, {
      method: "DELETE",
    });
  },

  async invite(
    workspaceId: string,
    input: { username: string; role: WorkspaceRole },
  ): Promise<{ message: string }> {
    return apiFetch<{ message: string }>(
      `/workspaces/${workspaceId}/invitations`,
      {
        method: "POST",
        body: JSON.stringify(input),
      },
    );
  },

  async listInvitations(
    workspaceId: string,
  ): Promise<WorkspaceInvitation[]> {
    return apiFetch<WorkspaceInvitation[]>(
      `/workspaces/${workspaceId}/invitations`,
    );
  },

  async cancelInvitation(
    workspaceId: string,
    invitationId: string,
  ): Promise<WorkspaceInvitation> {
    return apiFetch<WorkspaceInvitation>(
      `/workspaces/${workspaceId}/invitations/${invitationId}`,
      { method: "DELETE" },
    );
  },

  async listMyInvitations(): Promise<WorkspaceInvitation[]> {
    return apiFetch<WorkspaceInvitation[]>("/me/invitations");
  },

  async acceptInvitation(invitationId: string): Promise<WorkspaceInvitation> {
    return apiFetch<WorkspaceInvitation>(
      `/me/invitations/${invitationId}/accept`,
      { method: "POST" },
    );
  },

  async declineInvitation(invitationId: string): Promise<WorkspaceInvitation> {
    return apiFetch<WorkspaceInvitation>(
      `/me/invitations/${invitationId}/decline`,
      { method: "POST" },
    );
  },
};
