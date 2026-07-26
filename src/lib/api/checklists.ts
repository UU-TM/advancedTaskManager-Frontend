import type { Checklist, ChecklistItem } from "@/types/domain";
import { apiFetch } from "./client";

export const checklistsApi = {
  listByCard(cardId: string) {
    return apiFetch<Checklist[]>(`/cards/${cardId}/checklists`);
  },

  create(cardId: string, title: string) {
    return apiFetch<Checklist>(`/cards/${cardId}/checklists`, {
      method: "POST",
      body: JSON.stringify({ title }),
    });
  },

  update(id: string, input: { title?: string }) {
    return apiFetch<Checklist>(`/checklists/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  remove(id: string) {
    return apiFetch<void>(`/checklists/${id}`, { method: "DELETE" });
  },

  addItem(checklistId: string, title: string) {
    return apiFetch<ChecklistItem>(`/checklists/${checklistId}/items`, {
      method: "POST",
      body: JSON.stringify({ title }),
    });
  },

  updateItem(
    id: string,
    input: { title?: string; completed?: boolean },
  ) {
    return apiFetch<ChecklistItem>(`/checklist-items/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  removeItem(id: string) {
    return apiFetch<void>(`/checklist-items/${id}`, { method: "DELETE" });
  },
};
