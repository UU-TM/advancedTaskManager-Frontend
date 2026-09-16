import { apiFetch } from "./client";

export type PackKind = "TEMPLATE" | "AUTOMATION" | "AI_SKILL";

export type MarketplacePack = {
  id: string;
  kind: PackKind;
  name: string;
  description: string;
  snapshot: unknown;
  isPublic: boolean;
  createdById: string | null;
  createdAt: string;
};

export const marketplaceApi = {
  list() {
    return apiFetch<MarketplacePack[]>("/marketplace/packs");
  },

  create(input: {
    kind: PackKind;
    name: string;
    description?: string;
    snapshot: Record<string, unknown>;
    isPublic?: boolean;
  }) {
    return apiFetch<MarketplacePack>("/marketplace/packs", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  install(workspaceId: string, packId: string) {
    return apiFetch<unknown>(`/workspaces/${workspaceId}/marketplace/install`, {
      method: "POST",
      body: JSON.stringify({ packId }),
    });
  },
};
