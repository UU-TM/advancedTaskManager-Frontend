"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  automationsApi,
  type CreateAutomationInput,
} from "@/lib/api";

export const automationKeys = {
  all: ["automations"] as const,
  board: (boardId: string) =>
    [...automationKeys.all, "board", boardId] as const,
};

export function useAutomations(boardId?: string) {
  return useQuery({
    queryKey: automationKeys.board(boardId ?? ""),
    queryFn: () => automationsApi.list(boardId!),
    enabled: !!boardId,
  });
}

export function useCreateAutomation(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAutomationInput) =>
      automationsApi.create(boardId, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: automationKeys.board(boardId) });
    },
  });
}

export function useUpdateAutomation(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...input
    }: { id: string } & Partial<CreateAutomationInput>) =>
      automationsApi.update(id, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: automationKeys.board(boardId) });
    },
  });
}

export function useDeleteAutomation(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => automationsApi.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: automationKeys.board(boardId) });
    },
  });
}
