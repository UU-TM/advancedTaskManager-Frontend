import type { AppNotification } from "@/types/domain";
import { apiFetch } from "./client";

export const notificationsApi = {
  list(): Promise<AppNotification[]> {
    return apiFetch<AppNotification[]>("/me/notifications");
  },

  markRead(id: string): Promise<AppNotification> {
    return apiFetch<AppNotification>(`/me/notifications/${id}/read`, {
      method: "POST",
    });
  },

  markAllRead(): Promise<AppNotification[]> {
    return apiFetch<AppNotification[]>("/me/notifications/read-all", {
      method: "POST",
    });
  },
};
