import type { SmartList } from "@/types/domain";
import { apiFetch } from "./client";

export type CreateSmartListInput = {
  name: string;
  filters: Record<string, unknown> | unknown[];
};

export type UpdateSmartListInput = {
  name?: string;
  filters?: Record<string, unknown> | unknown[];
};

export const smartListsApi = {
  listMine(): Promise<SmartList[]> {
    return apiFetch<SmartList[]>("/me/smart-lists");
  },

  createMine(input: CreateSmartListInput): Promise<SmartList> {
    return apiFetch<SmartList>("/me/smart-lists", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  updateMine(id: string, input: UpdateSmartListInput): Promise<SmartList> {
    return apiFetch<SmartList>(`/me/smart-lists/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  deleteMine(id: string): Promise<SmartList> {
    return apiFetch<SmartList>(`/me/smart-lists/${id}`, { method: "DELETE" });
  },
};
