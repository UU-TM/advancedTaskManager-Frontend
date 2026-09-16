"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { marketplaceApi } from "@/lib/api";

export const marketplaceKeys = {
  all: ["marketplace"] as const,
  packs: () => [...marketplaceKeys.all, "packs"] as const,
};

export function useMarketplacePacks() {
  return useQuery({
    queryKey: marketplaceKeys.packs(),
    queryFn: () => marketplaceApi.list(),
  });
}

export function useInstallPack(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (packId: string) =>
      marketplaceApi.install(workspaceId, packId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: marketplaceKeys.all });
    },
  });
}
