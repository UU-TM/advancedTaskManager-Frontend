"use client";

import { useMemo, useRef } from "react";
import {
  addDays,
  differenceInCalendarDays,
  format,
  min,
  max,
  startOfDay,
} from "date-fns";
import { useTranslations } from "next-intl";
import { useUpdateCard } from "@/hooks/use-card";
import type { BoardColumn, Card, CardDependency } from "@/types/domain";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type BoardTimelineViewProps = {
  columns: BoardColumn[];
  dependencies: CardDependency[];
  onOpenCard: (id: string) => void;
};

const DAY_WIDTH = 28;

export function BoardTimelineView({
  columns,
  dependencies,
  onOpenCard,
}: BoardTimelineViewProps) {
  const t = useTranslations("boardViews");
  const updateCard = useUpdateCard();
  const scrollRef = useRef<HTMLDivElement>(null);

  const cards = useMemo(() => {
    const list: Card[] = [];
    for (const col of columns) list.push(...(col.cards ?? []));
    return list.filter((c) => c.startDate || c.dueDate);
  }, [columns]);

  const range = useMemo(() => {
    if (cards.length === 0) {
      const today = startOfDay(new Date());
      return { start: addDays(today, -7), end: addDays(today, 28) };
    }
    const dates = cards.flatMap((c) => {
      const out: Date[] = [];
      if (c.startDate) out.push(new Date(c.startDate));
      if (c.dueDate) out.push(new Date(c.dueDate));
      return out;
    });
    return {
      start: addDays(startOfDay(min(dates)), -3),
      end: addDays(startOfDay(max(dates)), 10),
    };
  }, [cards]);

  const totalDays = Math.max(
    1,
    differenceInCalendarDays(range.end, range.start) + 1,
  );
  const width = totalDays * DAY_WIDTH;

  const dayHeaders = Array.from({ length: totalDays }, (_, i) =>
    addDays(range.start, i),
  );

  function barFor(card: Card) {
    const start = startOfDay(
      new Date(card.startDate ?? card.dueDate ?? range.start),
    );
    const end = startOfDay(
      new Date(card.dueDate ?? card.startDate ?? range.start),
    );
    const left = differenceInCalendarDays(start, range.start) * DAY_WIDTH;
    const span =
      Math.max(1, differenceInCalendarDays(end, start) + 1) * DAY_WIDTH;
    return { left, width: span };
  }

  return (
    <div className="flex h-full flex-col overflow-hidden p-4 md:p-6" dir="ltr">
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-auto rounded-xl border border-border">
        <div style={{ width: Math.max(width + 200, 800) }} className="min-w-full">
          <div className="sticky top-0 z-10 flex border-b border-border bg-muted/90 backdrop-blur">
            <div className="sticky start-0 z-20 w-48 shrink-0 border-e border-border bg-muted px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">
              {t("colTitle")}
            </div>
            <div className="relative flex" style={{ width }}>
              {dayHeaders.map((d) => (
                <div
                  key={d.toISOString()}
                  className="border-e border-border/60 px-0.5 py-2 text-center text-[10px] text-muted-foreground"
                  style={{ width: DAY_WIDTH }}
                >
                  {format(d, "d")}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            {cards.map((card) => {
              const bar = barFor(card);
              return (
                <div key={card.id} className="flex border-b border-border/50">
                  <button
                    type="button"
                    className="sticky start-0 z-10 w-48 shrink-0 cursor-pointer truncate border-e border-border bg-card px-3 py-3 text-start text-sm font-medium hover:bg-muted/40"
                    onClick={() => onOpenCard(card.id)}
                  >
                    {card.title}
                  </button>
                  <div className="relative h-12" style={{ width }}>
                    <div
                      className={cn(
                        "absolute top-2 h-7 cursor-pointer rounded-md bg-primary/80 px-2 text-[11px] leading-7 text-primary-foreground shadow-sm",
                        card.isBlocked && "bg-destructive/80",
                      )}
                      style={{ left: bar.left, width: bar.width }}
                      onClick={() => onOpenCard(card.id)}
                      onMouseDown={(e) => {
                        if (e.button !== 0) return;
                        const startX = e.clientX;
                        const origLeft = bar.left;
                        const onMove = (ev: MouseEvent) => {
                          const deltaDays = Math.round(
                            (ev.clientX - startX) / DAY_WIDTH,
                          );
                          void deltaDays;
                          void origLeft;
                        };
                        const onUp = (ev: MouseEvent) => {
                          window.removeEventListener("mousemove", onMove);
                          window.removeEventListener("mouseup", onUp);
                          const deltaDays = Math.round(
                            (ev.clientX - startX) / DAY_WIDTH,
                          );
                          if (!deltaDays) return;
                          const nextDue = card.dueDate
                            ? addDays(new Date(card.dueDate), deltaDays)
                            : addDays(new Date(), deltaDays);
                          const nextStart = card.startDate
                            ? addDays(new Date(card.startDate), deltaDays)
                            : undefined;
                          updateCard.mutate(
                            {
                              id: card.id,
                              input: {
                                dueDate: nextDue.toISOString(),
                                ...(nextStart
                                  ? { startDate: nextStart.toISOString() }
                                  : {}),
                              },
                            },
                            {
                              onSuccess: () => toast.success(t("dueUpdated")),
                              onError: () => toast.error(t("dueFailed")),
                            },
                          );
                        };
                        window.addEventListener("mousemove", onMove);
                        window.addEventListener("mouseup", onUp);
                      }}
                    >
                      {card.title}
                    </div>
                  </div>
                </div>
              );
            })}

            {cards.length === 0 && (
              <p className="p-8 text-center text-sm text-muted-foreground">
                {t("timelineEmpty")}
              </p>
            )}

            {/* Dependency arrows (simple SVG overlay across rows is complex; show list hint) */}
            {dependencies.length > 0 && (
              <p className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
                {t("depsCount", { count: dependencies.length })}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
