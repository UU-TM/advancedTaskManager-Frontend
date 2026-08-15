"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ListChecks } from "lucide-react";
import { useHome } from "@/hooks/use-home";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { WidgetShell } from "./widget-shell";
import { AnimatedNumber, useMotionSafe } from "./motion";

export function ChecklistPulseWidget() {
  const t = useTranslations("dashboard.pack.checklistPulse");
  const { data, isLoading } = useHome();
  const safe = useMotionSafe();
  const cards = (data?.assignedCards ?? [])
    .filter((c) => !c.archivedAt && c.totalChecklistItems > 0)
    .slice(0, 5);

  return (
    <WidgetShell>
      <h2 className="mb-4 text-base font-semibold">{t("title")}</h2>
      {isLoading && <Skeleton className="h-24 w-full" />}
      {!isLoading && cards.length === 0 && (
        <EmptyState
          icon={ListChecks}
          title={t("emptyTitle")}
          description={t("emptyDescription")}
        />
      )}
      {cards.length > 0 && (
      <ul className="space-y-3">
        {cards.map((card, i) => {
          const pct = Math.round(
            (card.completedChecklistItems / card.totalChecklistItems) * 100,
          );
          return (
            <li key={card.id}>
              <Link
                href={`/boards/${card.boardId}?card=${card.id}`}
                className="block space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium">{card.title}</span>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    <AnimatedNumber value={pct} />%
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full bg-dashboard-accent"
                    initial={safe ? { width: 0 } : false}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                  />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
      )}
    </WidgetShell>
  );
}
