"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  sprintsApi,
  type CreateSprintInput,
  type UpdateSprintInput,
} from "@/lib/api";

export const sprintKeys = {
  all: ["sprints"] as const,
  workspace: (workspaceId: string) =>
    [...sprintKeys.all, workspaceId] as const,
};

export function useSprints(workspaceId: string | undefined) {
  return useQuery({
    queryKey: sprintKeys.workspace(workspaceId ?? ""),
    queryFn: () => sprintsApi.list(workspaceId!),
    enabled: !!workspaceId,
  });
}

export function useCreateSprint(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSprintInput) =>
      sprintsApi.create(workspaceId, input),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: sprintKeys.workspace(workspaceId),
      });
    },
  });
}

export function useUpdateSprint(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateSprintInput }) =>
      sprintsApi.update(workspaceId, id, input),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: sprintKeys.workspace(workspaceId),
      });
    },
  });
}

export function useActivateSprint(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sprintsApi.activate(id),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: sprintKeys.workspace(workspaceId),
      });
    },
  });
}

export function useCloseSprint(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sprintsApi.close(id),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: sprintKeys.workspace(workspaceId),
      });
    },
  });
}
