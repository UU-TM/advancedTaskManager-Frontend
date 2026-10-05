"use client";

import type { ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Ban,
  Calendar,
  CheckSquare,
  MessageSquare,
  Paperclip,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatAppDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n/config";
import type { Card } from "@/types/domain";
import { PRIORITY_COLORS } from "./priority";

export function TaskCardBody({
  card,
  trailing,
}: {
  card: Card;
  trailing?: ReactNode;
}) {
  const tCard = useTranslations("card");
  const locale = useLocale() as Locale;
  const due = formatAppDate(card.dueDate, "d MMM", locale);
  const dueTime = card.dueDate ? new Date(card.dueDate).getTime() : null;
  const overdue = dueTime != null && dueTime < Date.now();
  const dueSoon =
    dueTime != null && !overdue && dueTime < Date.now() + 2 * 24 * 60 * 60 * 1000;
  const extraAssignees = Math.max(0, (card.assignees?.length ?? 0) - 3);

  const priorityLabel = (p: NonNullable<Card["priority"]>) => {
    switch (p) {
      case "LOW":
        return tCard("priorityLow");
      case "MEDIUM":
        return tCard("priorityMedium");
      case "HIGH":
        return tCard("priorityHigh");
      case "URGENT":
        return tCard("priorityUrgent");
    }
  };

  return (
    <>
      {card.coverColor && (
        <div
          className="h-8 rounded-t-md"
          style={{ backgroundColor: card.coverColor }}
        />
      )}
      <div className="relative space-y-1.5 p-2">
        {trailing}
        {card.labels && card.labels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {card.labels.map((label) => (
              <span
                key={label.id}
                className="inline-flex items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-[11px] text-foreground"
              >
                <span
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: label.color }}
                  aria-hidden
                />
                {label.name}
              </span>
            ))}
          </div>
        )}
        <p className={cn("font-medium leading-snug", trailing && "pe-6")}>
          {card.title}
        </p>
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {card.priority && (
            <span
              className={cn(
                "rounded px-1.5 py-0.5 text-[11px] font-semibold",
                PRIORITY_COLORS[card.priority],
              )}
            >
              {priorityLabel(card.priority)}
            </span>
          )}
          {card.isBlocked && (
            <span className="inline-flex items-center gap-0.5 rounded bg-destructive/10 px-1.5 py-0.5 text-[11px] font-medium text-destructive">
              <Ban className="size-3" aria-hidden />
              {tCard("blocked")}
            </span>
          )}
          {(card._count?.checklists ?? 0) > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[11px] text-muted-foreground">
              <CheckSquare className="size-3" aria-hidden />
              <span className="sr-only">{tCard("checklists")}</span>
              {card._count!.checklists}
            </span>
          )}
          {due && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[11px]",
                overdue && "bg-destructive/10 font-medium text-destructive",
                dueSoon && !overdue && "bg-accent/15 font-medium text-accent",
                !overdue && !dueSoon && "text-muted-foreground",
              )}
            >
              <Calendar className="size-3" aria-hidden />
              {due}
            </span>
          )}
          {(card._count?.comments ?? 0) > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[11px] text-muted-foreground">
              <MessageSquare className="size-3" aria-hidden />
              <span className="sr-only">{tCard("comments")}</span>
              {card._count!.comments}
            </span>
          )}
          {(card._count?.attachments ?? 0) > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[11px] text-muted-foreground">
              <Paperclip className="size-3" aria-hidden />
              <span className="sr-only">{tCard("attachments")}</span>
              {card._count!.attachments}
            </span>
          )}
          {card.assignees && card.assignees.length > 0 && (
            <div className="ms-auto flex -space-x-1.5 rtl:space-x-reverse">
              {card.assignees.slice(0, 3).map((a) => (
                <Avatar
                  key={a.id}
                  className="size-5 border border-background"
                  title={a.username}
                >
                  <AvatarFallback className="text-[11px]">
                    {a.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
              {extraAssignees > 0 && (
                <span className="ps-1 text-[11px] text-muted-foreground">
                  +{extraAssignees}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
