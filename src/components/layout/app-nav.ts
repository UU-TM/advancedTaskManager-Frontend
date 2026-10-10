import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Building2,
  CalendarRange,
  ClipboardList,
  CreditCard,
  Home,
  LayoutTemplate,
  Plug,
  Settings,
  Trello,
  Users,
} from "lucide-react";

export type AppNavLabelKey =
  | "home"
  | "myBoards"
  | "analytics"
  | "workload"
  | "planning"
  | "templates"
  | "workspace"
  | "integrations"
  | "billing"
  | "settings"
  | "forms";

export type AppNavItemDef = {
  href: string;
  icon: LucideIcon;
  labelKey: AppNavLabelKey;
  /** When true, boards badge uses assigned open-card count. */
  boardsBadge?: boolean;
};

export const APP_NAV_GENERAL: AppNavItemDef[] = [
  { href: "/home", icon: Home, labelKey: "home" },
  { href: "/boards", icon: Trello, labelKey: "myBoards", boardsBadge: true },
];

export const APP_NAV_INSIGHTS: AppNavItemDef[] = [
  { href: "/analytics", icon: BarChart3, labelKey: "analytics" },
  { href: "/workload", icon: Users, labelKey: "workload" },
];

export const APP_NAV_PLANNING: AppNavItemDef[] = [
  { href: "/planning", icon: CalendarRange, labelKey: "planning" },
];

export const APP_NAV_MORE: AppNavItemDef[] = [
  { href: "/templates", icon: LayoutTemplate, labelKey: "templates" },
  { href: "/workspace", icon: Building2, labelKey: "workspace" },
  { href: "/integrations", icon: Plug, labelKey: "integrations" },
  { href: "/billing", icon: CreditCard, labelKey: "billing" },
];

export const APP_NAV_FOOTER: AppNavItemDef[] = [
  { href: "/settings", icon: Settings, labelKey: "settings" },
];

/** Flat list for the command palette (Forms stays reachable without a permanent nav slot). */
export const APP_NAV_COMMAND: AppNavItemDef[] = [
  ...APP_NAV_GENERAL,
  ...APP_NAV_INSIGHTS,
  ...APP_NAV_PLANNING,
  ...APP_NAV_MORE,
  { href: "/forms", icon: ClipboardList, labelKey: "forms" },
  ...APP_NAV_FOOTER,
];

export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/planning") {
    return (
      pathname === "/planning" ||
      pathname.startsWith("/planning/") ||
      pathname.startsWith("/sprints") ||
      pathname.startsWith("/goals") ||
      pathname.startsWith("/milestones")
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
