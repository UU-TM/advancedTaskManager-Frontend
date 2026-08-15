"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { CalendarClock } from "lucide-react";
import { useHome } from "@/hooks/use-home";
import { formatAppDate } from "@/lib/date";
import type { Locale } from "@/i18n/config";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { WidgetShell } from "./widget-shell";
import { MotionItem, MotionList, useMotionSafe } from "./motion";

export function DueSoonWidget() {
  const t = useTranslations("dashboard.pack.dueSoon");
  const locale = useLocale() as Locale;
  const { data, isLoading } = useHome();
  const safe = useMotionSafe();
  const items = (data?.dueSoon ?? []).slice(0, 6);

  return (
    <WidgetShell className="overflow-hidden">
      <h2 className="mb-4 text-base font-semibold tracking-tight">{t("title")}</h2>
      {isLoading && <Skeleton className="h-24 w-full" />}
      {!isLoading && items.length === 0 && (
        <EmptyState
          icon={CalendarClock}
          title={t("emptyTitle")}
          description={t("emptyDescription")}
        />
      )}
      {items.length > 0 && (
      <MotionList className="relative space-y-0 ps-4">
        <div className="absolute start-[7px] top-1 bottom-1 w-px bg-gradient-to-b from-dashboard-accent via-border to-transparent" />
        {items.map((card, i) => {
          const overdue =
            card.dueDate != null && new Date(card.dueDate).getTime() < Date.now();
          return (
            <MotionItem key={card.id}>
              <Link
                href={`/boards/${card.boardId}?card=${card.id}`}
                className="group relative flex gap-3 py-2.5 transition-colors"
              >
                <motion.span
                  className={`absolute start-[-13px] top-3.5 size-2.5 rounded-full ring-4 ring-card ${
                    overdue ? "bg-destructive" : "bg-dashboard-accent"
                  }`}
                  animate={
                    safe && overdue
                      ? { scale: [1, 1.25, 1], opacity: [1, 0.7, 1] }
                      : undefined
                  }
                  transition={{ duration: 1.6, repeat: Infinity }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium group-hover:text-dashboard-accent">
                    {card.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {card.boardName}
                    {card.dueDate
                      ? ` · ${formatAppDate(card.dueDate, "d MMM", locale)}`
                      : ""}
                  </p>
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </Link>
            </MotionItem>
          );
        })}
      </MotionList>
      )}
    </WidgetShell>
  );
}
