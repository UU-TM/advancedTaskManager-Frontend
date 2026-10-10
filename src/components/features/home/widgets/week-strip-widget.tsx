"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import { useDashboardDate } from "@/components/layout/dashboard-date-context";
import { useHome } from "@/hooks/use-home";
import { formatAppDate } from "@/lib/date";
import type { Locale } from "@/i18n/config";
import { Skeleton } from "@/components/ui/skeleton";
import { WidgetShell } from "./widget-shell";
import { cn } from "@/lib/utils";

export function WeekStripWidget() {
  const t = useTranslations("dashboard.pack.weekStrip");
  const locale = useLocale() as Locale;
  const { selectedDate, setSelectedDate } = useDashboardDate();
  const { data, isLoading } = useHome();
  const safe = !useReducedMotion();

  const days = useMemo(() => {
    const start = new Date(selectedDate);
    start.setDate(start.getDate() - start.getDay()); // week start Sunday
    start.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [selectedDate]);

  const dueByDay = useMemo(() => {
    const map = new Map<string, number>();
    for (const card of data?.assignedCards ?? []) {
      if (!card.dueDate || card.archivedAt) continue;
      const key = new Date(card.dueDate).toDateString();
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [data?.assignedCards]);

  return (
    <WidgetShell>
      <h2 className="mb-4 text-base font-semibold">{t("title")}</h2>
      {isLoading && <Skeleton className="h-16 w-full" />}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2" dir="ltr">
        {days.map((day, i) => {
          const key = day.toDateString();
          const count = dueByDay.get(key) ?? 0;
          const active = day.toDateString() === selectedDate.toDateString();
          const label =
            formatAppDate(day.toISOString(), "EEE", locale) ?? "";
          const num = formatAppDate(day.toISOString(), "d", locale) ?? "";
          return (
            <motion.button
              key={key}
              type="button"
              initial={safe ? { opacity: 0, y: 6 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              whileHover={safe ? { y: -2 } : undefined}
              whileTap={safe ? { scale: 0.96 } : undefined}
              onClick={() => {
                const next = new Date(day);
                next.setHours(0, 0, 0, 0);
                setSelectedDate(next);
              }}
              className={cn(
                "flex cursor-pointer flex-col items-center rounded-md border px-1 py-2 transition-colors",
                active
                  ? "border-[#357dff] bg-[#357dff]/10"
                  : "border-transparent bg-muted hover:bg-muted/70",
              )}
            >
              <span className="text-[10px] uppercase text-muted-foreground">
                {label}
              </span>
              <span className="text-sm font-semibold">{num}</span>
              <span className="mt-1 flex h-1.5 gap-0.5">
                {Array.from({ length: Math.min(count, 3) }).map((_, j) => (
                  <span
                    key={j}
                    className="size-1.5 rounded-full bg-[#357dff]"
                  />
                ))}
              </span>
            </motion.button>
          );
        })}
      </div>
      {!isLoading && (
        <p className="mt-3 text-xs text-muted-foreground">{t("hint")}</p>
      )}
    </WidgetShell>
  );
}
