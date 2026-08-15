"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  templatesApi,
  type CreateFromTemplateInput,
  type SaveAsTemplateInput,
} from "@/lib/api";
import { boardKeys } from "./use-boards";

export const templateKeys = {
  all: ["templates"] as const,
  list: (workspaceId?: string) =>
    [...templateKeys.all, "list", workspaceId ?? ""] as const,
  detail: (id: string) => [...templateKeys.all, "detail", id] as const,
};

export function useTemplates(workspaceId: string | undefined) {
  return useQuery({
    queryKey: templateKeys.list(workspaceId),
    queryFn: () => templatesApi.list(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useTemplate(id: string | undefined) {
  return useQuery({
    queryKey: templateKeys.detail(id ?? ""),
    queryFn: () => templatesApi.get(id!),
    enabled: !!id,
  });
}

export function useCreateBoardFromTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      workspaceId,
      input,
    }: {
      workspaceId: string;
      input: CreateFromTemplateInput;
    }) => templatesApi.createBoardFromTemplate(workspaceId, input),
    onSuccess: (_board, { workspaceId }) => {
      void queryClient.invalidateQueries({
        queryKey: boardKeys.byWorkspace(workspaceId),
      });
    },
  });
}

export function useSaveAsTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      boardId,
      input,
    }: {
      boardId: string;
      input: SaveAsTemplateInput;
    }) => templatesApi.saveAsTemplate(boardId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: templateKeys.all });
    },
  });
}
