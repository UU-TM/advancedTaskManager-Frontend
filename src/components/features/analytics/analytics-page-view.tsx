"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3 } from "lucide-react";
import { useActiveWorkspace } from "@/components/layout/active-workspace-context";
import { useAnalytics } from "@/hooks/use-analytics";
import type { AnalyticsRange } from "@/lib/api";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

const RANGES: AnalyticsRange[] = ["7d", "30d", "90d"];

export function AnalyticsPageView() {
  const t = useTranslations("analytics");
  const { workspaceId } = useActiveWorkspace();
  const [range, setRange] = useState<AnalyticsRange>("30d");
  const { data, isLoading, isError } = useAnalytics(workspaceId, range);

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-6 md:px-6">
      <PageHeader
        title={t("title")}
        description={t("subtitle")}
        actions={
          <div className="flex gap-1 rounded-md border border-border p-1">
            {RANGES.map((r) => (
              <Button
                key={r}
                size="sm"
                variant={range === r ? "default" : "ghost"}
                className="cursor-pointer"
                onClick={() => setRange(r)}
              >
                {t(`range.${r}`)}
              </Button>
            ))}
          </div>
        }
      />

      {!workspaceId && (
        <EmptyState
          icon={BarChart3}
          title={t("noWorkspace")}
          description={t("noWorkspaceBody")}
        />
      )}

      {workspaceId && isLoading && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-24 rounded-md" />
          <Skeleton className="h-24 rounded-md" />
          <Skeleton className="h-24 rounded-md" />
          <Skeleton className="h-64 rounded-md sm:col-span-3" />
        </div>
      )}

      {isError && (
        <EmptyState
          icon={BarChart3}
          title={t("errorTitle")}
          description={t("errorBody")}
        />
      )}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                label: t("avgCycleTime"),
                value: `${data.avgCycleTimeHours.toFixed(1)}h`,
              },
              { label: t("wip"), value: String(data.wipCount) },
              {
                label: t("completed"),
                value: String(data.completedCount),
              },
            ].map((m) => (
              <div
                key={m.label}
                className="rounded-md border border-border bg-card px-4 py-5"
              >
                <p className="text-sm text-muted-foreground">
                  {m.label}
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight">
                  {m.value}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-md border border-border bg-card p-4">
            <h2 className="mb-4 text-sm font-semibold">{t("throughput")}</h2>
            <div className={cn("h-64 w-full")}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.throughputByWeek}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: "0.75rem",
                      color: "var(--popover-foreground)",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="var(--chart-1)"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
