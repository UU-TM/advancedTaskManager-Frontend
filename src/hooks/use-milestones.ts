"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  milestonesApi,
  type CreateMilestoneInput,
  type UpdateMilestoneInput,
} from "@/lib/api/milestones";

export const milestoneKeys = {
  all: ["milestones"] as const,
  byWorkspace: (workspaceId: string) =>
    [...milestoneKeys.all, workspaceId] as const,
};

export function useMilestones(workspaceId: string | undefined) {
  return useQuery({
    queryKey: milestoneKeys.byWorkspace(workspaceId ?? ""),
    queryFn: () => milestonesApi.list(workspaceId!),
    enabled: !!workspaceId,
  });
}

export function useCreateMilestone(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMilestoneInput) =>
      milestonesApi.create(workspaceId, input),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: milestoneKeys.byWorkspace(workspaceId),
      });
    },
  });
}

export function useUpdateMilestone(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateMilestoneInput & { id: string }) =>
      milestonesApi.update(id, input),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: milestoneKeys.byWorkspace(workspaceId),
      });
    },
  });
}

export function useDeleteMilestone(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => milestonesApi.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: milestoneKeys.byWorkspace(workspaceId),
      });
    },
  });
}
