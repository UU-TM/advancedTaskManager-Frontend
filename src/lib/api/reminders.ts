import type { Reminder } from "@/types/domain";
import { apiFetch } from "./client";

export interface CreateReminderInput {
  title: string;
  scheduledAt: string;
  linkUrl?: string | null;
  cardId?: string | null;
  boardId?: string | null;
}

export const remindersApi = {
  list(): Promise<Reminder[]> {
    return apiFetch<Reminder[]>("/me/reminders");
  },

  create(input: CreateReminderInput): Promise<Reminder> {
    return apiFetch<Reminder>("/me/reminders", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  update(
    id: string,
    data: Partial<CreateReminderInput>,
  ): Promise<Reminder> {
    return apiFetch<Reminder>(`/me/reminders/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  remove(id: string): Promise<{ id: string }> {
    return apiFetch<{ id: string }>(`/me/reminders/${id}`, {
      method: "DELETE",
    });
  },
};
