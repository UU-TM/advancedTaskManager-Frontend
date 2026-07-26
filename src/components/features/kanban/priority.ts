import type { CardPriority } from "@/types/domain";

export const PRIORITY_COLORS: Record<CardPriority, string> = {
  URGENT: "bg-destructive text-destructive-foreground",
  HIGH: "bg-accent text-accent-foreground",
  MEDIUM: "bg-amber-400 text-slate-900 dark:bg-amber-500 dark:text-slate-950",
  LOW: "bg-primary/15 text-primary",
};

export const LABEL_PRESET_COLORS = [
  "#DC2626",
  "#EA580C",
  "#CA8A04",
  "#059669",
  "#0D9488",
  "#0284C7",
  "#475569",
  "#64748B",
];
