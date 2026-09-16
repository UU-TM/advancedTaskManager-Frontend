"use client";

import { useMemo, useState } from "react";
import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { useLocale, useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUpdateCard } from "@/hooks/use-card";
import type { BoardColumn, Card } from "@/types/domain";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type BoardCalendarViewProps = {
  columns: BoardColumn[];
  onOpenCard: (id: string) => void;
};

export function BoardCalendarView({
  columns,
  onOpenCard,
}: BoardCalendarViewProps) {
  const t = useTranslations("boardViews");
  const locale = useLocale();
  const updateCard = useUpdateCard();
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));

  const cards = useMemo(() => {
    const list: Card[] = [];
    for (const col of columns) list.push(...(col.cards ?? []));
    return list.filter((c) => c.dueDate);
  }, [columns]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  const monthLabel = format(cursor, locale === "fa" ? "MMMM yyyy" : "MMMM yyyy");

  return (
    <div className="flex h-full flex-col gap-3 overflow-hidden p-4 md:p-6" dir="ltr">
      <div className="flex items-center gap-2">
        <Button
          size="icon"
          variant="outline"
          className="cursor-pointer"
          onClick={() => setCursor((d) => startOfMonth(addDays(d, -15)))}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <h2 className="min-w-[10rem] text-center text-sm font-semibold">
          {monthLabel}
        </h2>
        <Button
          size="icon"
          variant="outline"
          className="cursor-pointer"
          onClick={() => setCursor((d) => startOfMonth(addDays(d, 45)))}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-auto rounded-xl border border-border bg-border">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            className="bg-muted px-2 py-1.5 text-center text-[11px] font-semibold uppercase text-muted-foreground"
          >
            {d}
          </div>
        ))}
        {days.map((day) => {
          const dayCards = cards.filter(
            (c) => c.dueDate && isSameDay(new Date(c.dueDate), day),
          );
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "min-h-24 bg-card p-1.5",
                !isSameMonth(day, cursor) && "bg-muted/40 text-muted-foreground",
              )}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const cardId = e.dataTransfer.getData("text/card-id");
                if (!cardId) return;
                const noon = new Date(day);
                noon.setHours(12, 0, 0, 0);
                updateCard.mutate(
                  { id: cardId, input: { dueDate: noon.toISOString() } },
                  {
                    onSuccess: () => toast.success(t("dueUpdated")),
                    onError: () => toast.error(t("dueFailed")),
                  },
                );
              }}
            >
              <div className="mb-1 text-xs font-medium">{format(day, "d")}</div>
              <div className="space-y-1">
                {dayCards.slice(0, 4).map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    draggable
                    onDragStart={(e) =>
                      e.dataTransfer.setData("text/card-id", card.id)
                    }
                    onClick={() => onOpenCard(card.id)}
                    className="block w-full cursor-grab truncate rounded-md bg-primary/10 px-1.5 py-0.5 text-start text-[11px] font-medium text-primary active:cursor-grabbing"
                  >
                    {card.title}
                  </button>
                ))}
                {dayCards.length > 4 && (
                  <p className="text-[10px] text-muted-foreground">
                    +{dayCards.length - 4}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
