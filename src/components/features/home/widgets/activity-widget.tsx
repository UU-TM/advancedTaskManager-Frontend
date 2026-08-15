"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Activity } from "lucide-react";
import { useActivityStats } from "@/hooks/use-activity-stats";
import type { ActivityStatsPage, StatMetric } from "@/types/domain";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { WidgetShell } from "./widget-shell";
import { cn } from "@/lib/utils";

const RING_COLORS = {
  workingHours: "#eab308",
  tasksCompleted: "#14b8a6",
  projectsCompleted: "#3b82f6",
} as const;

function DonutChart({ page }: { page: ActivityStatsPage }) {
  const rings = [
    {
      metric: page.workingHours,
      color: RING_COLORS.workingHours,
      radius: 42,
    },
    {
      metric: page.tasksCompleted,
      color: RING_COLORS.tasksCompleted,
      radius: 32,
    },
    {
      metric: page.projectsCompleted,
      color: RING_COLORS.projectsCompleted,
      radius: 22,
    },
  ];

  return (
    <svg viewBox="0 0 100 100" className="size-28 shrink-0">
      {rings.map((ring) => {
        const circumference = 2 * Math.PI * ring.radius;
        const ratio =
          ring.metric.target > 0
            ? Math.min(1, ring.metric.value / ring.metric.target)
            : 0;
        const dash = circumference * ratio;
        return (
          <g key={ring.radius}>
            <circle
              cx="50"
              cy="50"
              r={ring.radius}
              fill="none"
              stroke="#f3f4f6"
              strokeWidth="6"
            />
            <circle
              cx="50"
              cy="50"
              r={ring.radius}
              fill="none"
              stroke={ring.color}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference - dash}`}
              transform="rotate(-90 50 50)"
            />
          </g>
        );
      })}
    </svg>
  );
}

function StatRow({
  label,
  color,
  metric,
}: {
  label: string;
  color: string;
  metric: StatMetric;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="h-8 w-1 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm">
          <span className="text-base font-semibold text-foreground">
            {metric.value}
          </span>
          <span className="text-muted-foreground">/{metric.target}</span>
        </p>
      </div>
    </div>
  );
}

export function ActivityWidget() {
  const t = useTranslations("dashboard.activity");
  const [range, setRange] = useState<"weekly" | "daily">("weekly");
  const [pageIndex, setPageIndex] = useState(0);
  const { data, isLoading, isError } = useActivityStats(range);
  const page = data?.pages[pageIndex] ?? data?.pages[0];
  const isEmpty =
    !isLoading &&
    !isError &&
    (!page ||
      (page.workingHours.value === 0 &&
        page.tasksCompleted.value === 0 &&
        page.projectsCompleted.value === 0));

  return (
    <WidgetShell>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold">{t("title")}</h2>
        <div className="flex items-center gap-2 text-sm">
          <button
            type="button"
            className={cn(
              "cursor-pointer",
              range === "weekly"
                ? "font-medium text-dashboard-accent underline underline-offset-4"
                : "text-muted-foreground",
            )}
            onClick={() => {
              setRange("weekly");
              setPageIndex(0);
            }}
          >
            {t("weekly")}
          </button>
          <button
            type="button"
            className={cn(
              "cursor-pointer",
              range === "daily"
                ? "font-medium text-dashboard-accent underline underline-offset-4"
                : "text-muted-foreground",
            )}
            onClick={() => {
              setRange("daily");
              setPageIndex(0);
            }}
          >
            {t("daily")}
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-muted/50 p-4">
        {isLoading && <Skeleton className="h-32 w-full" />}
        {isError && (
          <p className="text-sm text-destructive">{t("failed")}</p>
        )}
        {isEmpty && (
          <EmptyState
            icon={Activity}
            title={t("emptyTitle")}
            description={t("emptyDescription")}
            className="py-4"
          />
        )}
        {!isEmpty && page && (
          <div className="flex items-center gap-4">
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <StatRow
                label={t("workingHours")}
                color={RING_COLORS.workingHours}
                metric={page.workingHours}
              />
              <StatRow
                label={t("tasksCompleted")}
                color={RING_COLORS.tasksCompleted}
                metric={page.tasksCompleted}
              />
              <StatRow
                label={t("projectsCompleted")}
                color={RING_COLORS.projectsCompleted}
                metric={page.projectsCompleted}
              />
            </div>
            <DonutChart page={page} />
          </div>
        )}
      </div>

      {data && !isEmpty && (
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {data.pages.map((p, i) => (
            <button
              key={p.key}
              type="button"
              aria-label={t("pageDot", { page: i + 1 })}
              className={cn(
                "size-1.5 cursor-pointer rounded-full transition-colors",
                i === pageIndex ? "bg-foreground" : "bg-muted-foreground/40",
              )}
              onClick={() => setPageIndex(i)}
            />
          ))}
        </div>
      )}
    </WidgetShell>
  );
}
