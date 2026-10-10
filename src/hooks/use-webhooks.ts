"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  webhooksApi,
  type CreateWebhookInput,
  type UpdateWebhookInput,
} from "@/lib/api/webhooks";

export const webhookKeys = {
  byWorkspace: (workspaceId: string) => ["webhooks", workspaceId] as const,
};

export function useWebhooks(workspaceId: string | undefined) {
  return useQuery({
    queryKey: webhookKeys.byWorkspace(workspaceId ?? ""),
    queryFn: () => webhooksApi.list(workspaceId!),
    enabled: !!workspaceId,
  });
}

export function useCreateWebhook(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateWebhookInput) =>
      webhooksApi.create(workspaceId, input),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: webhookKeys.byWorkspace(workspaceId),
      });
    },
  });
}

export function useUpdateWebhook(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateWebhookInput & { id: string }) =>
      webhooksApi.update(id, input),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: webhookKeys.byWorkspace(workspaceId),
      });
    },
  });
}

export function useDeleteWebhook(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => webhooksApi.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: webhookKeys.byWorkspace(workspaceId),
      });
    },
  });
}
