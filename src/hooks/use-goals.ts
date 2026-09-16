"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  goalsApi,
  type CreateGoalInput,
  type CreateKeyResultInput,
  type UpdateGoalInput,
  type UpdateKeyResultInput,
} from "@/lib/api";

export const goalKeys = {
  all: ["goals"] as const,
  workspace: (workspaceId: string) => [...goalKeys.all, workspaceId] as const,
};

export function useGoals(workspaceId: string | undefined) {
  return useQuery({
    queryKey: goalKeys.workspace(workspaceId ?? ""),
    queryFn: () => goalsApi.list(workspaceId!),
    enabled: !!workspaceId,
  });
}

export function useCreateGoal(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateGoalInput) =>
      goalsApi.create(workspaceId, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: goalKeys.workspace(workspaceId) });
    },
  });
}

export function useUpdateGoal(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateGoalInput }) =>
      goalsApi.update(id, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: goalKeys.workspace(workspaceId) });
    },
  });
}

export function useDeleteGoal(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => goalsApi.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: goalKeys.workspace(workspaceId) });
    },
  });
}

export function useAddKeyResult(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      goalId,
      input,
    }: {
      goalId: string;
      input: CreateKeyResultInput;
    }) => goalsApi.addKeyResult(goalId, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: goalKeys.workspace(workspaceId) });
    },
  });
}

export function useUpdateKeyResult(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateKeyResultInput;
    }) => goalsApi.updateKeyResult(id, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: goalKeys.workspace(workspaceId) });
    },
  });
}
