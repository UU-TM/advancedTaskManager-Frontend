"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Radio } from "lucide-react";
import { useHome } from "@/hooks/use-home";
import { formatAppDate } from "@/lib/date";
import type { Locale } from "@/i18n/config";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { WidgetShell } from "./widget-shell";
import { MotionItem, MotionList, useMotionSafe } from "./motion";

export function RecentActivityWidget() {
  const t = useTranslations("dashboard.pack.recentActivity");
  const locale = useLocale() as Locale;
  const { data, isLoading } = useHome();
  const safe = useMotionSafe();
  const events = (data?.recentActivity ?? []).slice(0, 8);

  return (
    <WidgetShell>
      <h2 className="mb-4 text-base font-semibold">{t("title")}</h2>
      {isLoading && <Skeleton className="h-28 w-full" />}
      {!isLoading && events.length === 0 && (
        <EmptyState
          icon={Radio}
          title={t("emptyTitle")}
          description={t("emptyDescription")}
        />
      )}
      {events.length > 0 && (
      <MotionList className="space-y-1">
        {events.map((ev) => (
          <MotionItem key={ev.id}>
            <Link
              href={
                ev.cardId
                  ? `/boards/${ev.boardId}?card=${ev.cardId}`
                  : `/boards/${ev.boardId}`
              }
              className="flex items-start gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-muted/60"
            >
              <motion.span
                className="mt-1.5 size-2 shrink-0 rounded-full bg-dashboard-accent"
                animate={safe ? { scale: [1, 1.4, 1] } : undefined}
                transition={{ duration: 2.4, repeat: Infinity, delay: Math.random() }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">
                  <span className="font-medium">@{ev.actor.username}</span>{" "}
                  <span className="text-muted-foreground">
                    {ev.type.replace(/\./g, " ")}
                  </span>
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {formatAppDate(ev.createdAt, "d MMM HH:mm", locale)}
                </p>
              </div>
            </Link>
          </MotionItem>
        ))}
      </MotionList>
      )}
    </WidgetShell>
  );
}
