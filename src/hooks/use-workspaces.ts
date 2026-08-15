"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { workspacesApi } from "@/lib/api";
import type { WorkspaceRole } from "@/types/domain";

export const workspaceKeys = {
  all: ["workspaces"] as const,
  list: () => [...workspaceKeys.all, "list"] as const,
  members: (workspaceId: string) =>
    [...workspaceKeys.all, "members", workspaceId] as const,
  invitations: (workspaceId: string) =>
    [...workspaceKeys.all, "invitations", workspaceId] as const,
  myInvitations: () => [...workspaceKeys.all, "my-invitations"] as const,
};

export function useWorkspaces() {
  return useQuery({
    queryKey: workspaceKeys.list(),
    queryFn: () => workspacesApi.list(),
  });
}

export function useWorkspaceMembers(workspaceId: string | undefined) {
  return useQuery({
    queryKey: workspaceKeys.members(workspaceId ?? ""),
    queryFn: () => workspacesApi.listMembers(workspaceId!),
    enabled: !!workspaceId,
  });
}

export function useWorkspaceInvitations(workspaceId: string | undefined) {
  return useQuery({
    queryKey: workspaceKeys.invitations(workspaceId ?? ""),
    queryFn: () => workspacesApi.listInvitations(workspaceId!),
    enabled: !!workspaceId,
  });
}

export function useMyInvitations(enabled = true) {
  return useQuery({
    queryKey: workspaceKeys.myInvitations(),
    queryFn: () => workspacesApi.listMyInvitations(),
    enabled,
  });
}

export function useCreateWorkspace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => workspacesApi.create({ name }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: workspaceKeys.list() });
    },
  });
}

export function useUpdateWorkspace(workspaceId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) =>
      workspacesApi.update(workspaceId!, { name }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: workspaceKeys.list() });
    },
  });
}

export function useDeleteWorkspace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (workspaceId: string) => workspacesApi.remove(workspaceId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: workspaceKeys.list() });
    },
  });
}

export function useRemoveWorkspaceMember(workspaceId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      workspacesApi.removeMember(workspaceId!, userId),
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: workspaceKeys.members(workspaceId ?? ""),
      });
    },
  });
}

export function useInviteToWorkspace(workspaceId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { username: string; role: WorkspaceRole }) =>
      workspacesApi.invite(workspaceId!, input),
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: workspaceKeys.invitations(workspaceId ?? ""),
      });
    },
  });
}

export function useCancelWorkspaceInvitation(workspaceId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) =>
      workspacesApi.cancelInvitation(workspaceId!, invitationId),
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: workspaceKeys.invitations(workspaceId ?? ""),
      });
    },
  });
}

export function useRespondToInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      invitationId: string;
      action: "accept" | "decline";
    }) => {
      if (input.action === "accept") {
        return workspacesApi.acceptInvitation(input.invitationId);
      }
      return workspacesApi.declineInvitation(input.invitationId);
    },
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: workspaceKeys.myInvitations() }),
        qc.invalidateQueries({ queryKey: workspaceKeys.list() }),
      ]);
    },
  });
}
