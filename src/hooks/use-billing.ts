"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { billingApi, type BillingPlan } from "@/lib/api";

export const billingKeys = {
  all: ["billing"] as const,
  workspace: (workspaceId: string) =>
    [...billingKeys.all, workspaceId] as const,
};

export function useBilling(workspaceId: string | undefined) {
  return useQuery({
    queryKey: billingKeys.workspace(workspaceId ?? ""),
    queryFn: () => billingApi.get(workspaceId!),
    enabled: !!workspaceId,
  });
}

export function useGrantPlan(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { plan: BillingPlan; seats?: number }) =>
      billingApi.grant(workspaceId, input),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: billingKeys.workspace(workspaceId),
      });
    },
  });
}

export function useCheckout(workspaceId: string) {
  return useMutation({
    mutationFn: (input: {
      plan: Exclude<BillingPlan, "FREE">;
      successUrl?: string;
      cancelUrl?: string;
    }) => billingApi.checkout(workspaceId, input),
  });
}
