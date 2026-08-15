"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { useActivityStats } from "@/hooks/use-activity-stats";
import { useTimeEntryHistory } from "@/hooks/use-time-entries";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { WidgetShell } from "./widget-shell";
import { AnimatedNumber, useMotionSafe } from "./motion";

export function WeekHoursWidget() {
  const t = useTranslations("dashboard.pack.weekHours");
  const { data: stats, isLoading: statsLoading } = useActivityStats("weekly");
  const { data: history = [], isLoading: histLoading } = useTimeEntryHistory(14);
  const safe = useMotionSafe();

  const page = stats?.pages.find((p) => p.key === "current");
  const hours = page?.workingHours.value ?? 0;
  const target = page?.workingHours.target ?? 40;

  const spark = useMemo(() => {
    const buckets = Array.from({ length: 7 }, () => 0);
    const now = Date.now();
    for (const entry of history) {
      const day = Math.floor(
        (now - new Date(entry.startedAt).getTime()) / (24 * 60 * 60 * 1000),
      );
      if (day >= 0 && day < 7) {
        buckets[6 - day]! += entry.elapsedMs / (1000 * 60 * 60);
      }
    }
    return buckets;
  }, [history]);

  const maxSpark = Math.max(...spark, 0.1);
  const isLoading = statsLoading || histLoading;
  const isEmpty = !isLoading && hours === 0 && spark.every((v) => v === 0);

  return (
    <WidgetShell>
      <h2 className="mb-2 text-base font-semibold">{t("title")}</h2>
      {isLoading && <Skeleton className="h-20 w-full" />}
      {isEmpty && (
        <EmptyState
          icon={Clock}
          title={t("emptyTitle")}
          description={t("emptyDescription")}
          className="py-3"
        />
      )}
      {!isLoading && !isEmpty && (
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-3xl font-bold tracking-tight">
            <AnimatedNumber value={hours} decimals={1} />
            <span className="ms-1 text-sm font-normal text-muted-foreground">
              / {target}h
            </span>
          </p>
          <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
        </div>
        <div className="flex h-12 items-end gap-1">
          {spark.map((v, i) => (
            <motion.div
              key={i}
              className="w-2 rounded-sm bg-dashboard-accent/80"
              initial={safe ? { height: 2 } : false}
              animate={{ height: Math.max(4, (v / maxSpark) * 48) }}
              transition={{ delay: i * 0.04, duration: 0.35 }}
            />
          ))}
        </div>
      </div>
      )}
    </WidgetShell>
  );
}
