"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiTokensApi, type CreateApiTokenInput } from "@/lib/api";

export const apiTokenKeys = {
  all: ["api-tokens"] as const,
  list: () => [...apiTokenKeys.all, "list"] as const,
};

export function useApiTokens() {
  return useQuery({
    queryKey: apiTokenKeys.list(),
    queryFn: () => apiTokensApi.list(),
  });
}

export function useCreateApiToken() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateApiTokenInput) => apiTokensApi.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: apiTokenKeys.list() });
    },
  });
}

export function useRevokeApiToken() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiTokensApi.revoke(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: apiTokenKeys.list() });
    },
  });
}
