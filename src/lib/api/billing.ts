import { apiFetch } from "./client";

export type BillingPlan = "FREE" | "TEAM" | "BUSINESS";

export type WorkspaceSubscription = {
  workspaceId: string;
  plan: BillingPlan;
  seats: number;
  aiCallsUsed: number;
  aiCallsResetAt: string | null;
  entitlements: {
    maxBoards: number;
    maxAutomations: number;
    maxAiCallsPerMonth: number;
  };
  updatedAt: string;
};

export const billingApi = {
  get(workspaceId: string) {
    return apiFetch<WorkspaceSubscription>(
      `/workspaces/${workspaceId}/billing`,
    );
  },

  grant(
    workspaceId: string,
    input: { plan: BillingPlan; seats?: number },
  ) {
    return apiFetch<WorkspaceSubscription>(
      `/workspaces/${workspaceId}/billing/grant`,
      {
        method: "POST",
        body: JSON.stringify(input),
      },
    );
  },

  checkout(
    workspaceId: string,
    input: {
      plan: Exclude<BillingPlan, "FREE">;
      successUrl?: string;
      cancelUrl?: string;
    },
  ) {
    return apiFetch<{ url?: string; checkoutUrl?: string }>(
      `/workspaces/${workspaceId}/billing/checkout`,
      {
        method: "POST",
        body: JSON.stringify(input),
      },
    );
  },
};
