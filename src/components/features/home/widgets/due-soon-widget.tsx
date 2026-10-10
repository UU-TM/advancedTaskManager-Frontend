"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { CalendarClock } from "lucide-react";
import { useHome } from "@/hooks/use-home";
import { formatAppDate } from "@/lib/date";
import type { Locale } from "@/i18n/config";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { WidgetShell } from "./widget-shell";

export function DueSoonWidget() {
  const t = useTranslations("dashboard.pack.dueSoon");
  const locale = useLocale() as Locale;
  const { data, isLoading } = useHome();
  const items = (data?.dueSoon ?? []).slice(0, 6);

  return (
    <WidgetShell className="overflow-hidden">
      <h2 className="mb-2 text-base font-semibold tracking-tight">{t("title")}</h2>
      {isLoading && <Skeleton className="h-24 w-full" />}
      {!isLoading && items.length === 0 && (
        <EmptyState
          icon={CalendarClock}
          title={t("emptyTitle")}
          description={t("emptyDescription")}
          className="border-0 bg-transparent px-0 py-6"
        />
      )}
      {items.length > 0 && (
      <ul className="divide-y divide-border">
        {items.map((card) => {
          const overdue =
            card.dueDate != null && new Date(card.dueDate).getTime() < Date.now();
          return (
            <li key={card.id}>
              <Link
                href={`/boards/${card.boardId}?card=${card.id}`}
                className="group flex items-baseline gap-3 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium group-hover:underline">
                    {card.title}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {card.boardName}
                  </p>
                </div>
                {card.dueDate && (
                  <span
                    className={
                      overdue
                        ? "shrink-0 text-xs font-medium text-destructive"
                        : "shrink-0 text-xs tabular-nums text-muted-foreground"
                    }
                  >
                    {formatAppDate(card.dueDate, "d MMM", locale)}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
      )}
    </WidgetShell>
  );
}
