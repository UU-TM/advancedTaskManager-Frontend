import type { TimeEntry } from "@/types/domain";
import { apiFetch } from "./client";

export const timeEntriesApi = {
  active(): Promise<TimeEntry | null> {
    return apiFetch<TimeEntry | null>("/me/time-entries/active");
  },

  list(limit = 20): Promise<TimeEntry[]> {
    return apiFetch<TimeEntry[]>(`/me/time-entries?limit=${limit}`);
  },

  start(cardId?: string): Promise<TimeEntry> {
    return apiFetch<TimeEntry>("/me/time-entries/start", {
      method: "POST",
      body: JSON.stringify(cardId ? { cardId } : {}),
    });
  },

  pause(): Promise<TimeEntry> {
    return apiFetch<TimeEntry>("/me/time-entries/pause", { method: "POST" });
  },

  resume(): Promise<TimeEntry> {
    return apiFetch<TimeEntry>("/me/time-entries/resume", { method: "POST" });
  },

  stop(): Promise<TimeEntry> {
    return apiFetch<TimeEntry>("/me/time-entries/stop", { method: "POST" });
  },
};
