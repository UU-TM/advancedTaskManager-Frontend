import type { AppNotification } from "@/types/domain";
import { apiFetch } from "./client";

export const inboxApi = {
  get() {
    return apiFetch<AppNotification[]>("/me/inbox");
  },
};
