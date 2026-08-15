import type { DashboardLayoutItem, DashboardPrefs } from "@/types/domain";
import { apiFetch } from "./client";

export const dashboardPrefsApi = {
  get(): Promise<DashboardPrefs> {
    return apiFetch<DashboardPrefs>("/me/dashboard-prefs");
  },

  update(layout: DashboardLayoutItem[]): Promise<DashboardPrefs> {
    return apiFetch<DashboardPrefs>("/me/dashboard-prefs", {
      method: "PATCH",
      body: JSON.stringify({ layout }),
    });
  },
};
