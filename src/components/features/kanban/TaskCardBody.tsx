"use client";

import type { ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Ban,
  Calendar,
  CheckSquare,
  Clock,
  MessageSquare,
  Paperclip,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAttachmentImageUrl } from "@/hooks/use-attachment-image";
import { formatAppDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n/config";
import type { Card } from "@/types/domain";
import { PRIORITY_COLORS } from "./priority";

function formatMinutes(total: number, locale: Locale) {
  const hours = Math.floor(total / 60);
  const minutes = Math.round(total % 60);
  const fmt = (value: number, unit: "hour" | "minute") =>
    new Intl.NumberFormat(locale, {
      style: "unit",
      unit,
      unitDisplay: locale === "fa" ? "short" : "narrow",
    }).format(value);
  if (hours && minutes) return `${fmt(hours, "hour")} ${fmt(minutes, "minute")}`;
  return hours ? fmt(hours, "hour") : fmt(minutes, "minute");
}

export function TaskCardBody({
  card,
  trailing,
  showLabelText = false,
}: {
  card: Card;
  trailing?: ReactNode;
  /** Board pref: render label names on the label bars. */
  showLabelText?: boolean;
}) {
  const { data: coverImageUrl, isLoading: coverImageLoading } =
    useAttachmentImageUrl(card.coverAttachmentId);
  const tCard = useTranslations("card");
  const locale = useLocale() as Locale;
  const due = formatAppDate(card.dueDate, "d MMM", locale);
  const dueTime = card.dueDate ? new Date(card.dueDate).getTime() : null;
  const overdue = dueTime != null && dueTime < Date.now();
  const dueSoon =
    dueTime != null && !overdue && dueTime < Date.now() + 2 * 24 * 60 * 60 * 1000;
  const start = due ? formatAppDate(card.startDate, "d MMM", locale) : "";
  const spentMinutes = Math.round((card.timeSpentMs ?? 0) / 60000);
  const estimate = card.estimateMinutes ?? 0;
  const time =
    spentMinutes > 0 && estimate > 0
      ? `${formatMinutes(spentMinutes, locale)} / ${formatMinutes(estimate, locale)}`
      : spentMinutes > 0
        ? formatMinutes(spentMinutes, locale)
        : estimate > 0
          ? formatMinutes(estimate, locale)
          : "";
  const overEstimate = estimate > 0 && spentMinutes > estimate;
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
      {coverImageUrl ? (
        <img
          src={coverImageUrl}
          alt=""
          draggable={false}
          className="h-28 w-full rounded-t-lg object-cover"
        />
      ) : card.coverAttachmentId && coverImageLoading ? (
        <div
          className="h-28 animate-pulse rounded-t-lg bg-muted"
          aria-hidden
        />
      ) : card.coverColor ? (
        <div
          className="h-8 rounded-t-lg"
          style={{ backgroundColor: card.coverColor }}
        />
      ) : null}
      <div className="relative space-y-1.5 px-3 pb-1 pt-2">
        {trailing}
        {card.labels && card.labels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {card.labels.map((label) =>
              showLabelText ? (
                <span
                  key={label.id}
                  title={label.name}
                  className="inline-block max-w-full truncate rounded-sm px-1.5 py-0.5 text-[11px] font-medium leading-4 text-white"
                  style={{ backgroundColor: label.color }}
                >
                  {label.name}
                </span>
              ) : (
                <span
                  key={label.id}
                  title={label.name}
                  className="inline-block h-2 min-w-10 max-w-16 rounded-sm"
                  style={{ backgroundColor: label.color }}
                  aria-label={label.name}
                />
              ),
            )}
          </div>
        )}
        <p
          className={cn(
            "text-sm font-medium leading-5 text-foreground",
            trailing && "pe-6",
          )}
        >
          {card.title}
        </p>
        {card.description?.trim() && (
          <p className="line-clamp-2 whitespace-pre-line text-xs leading-relaxed text-muted-foreground">
            {card.description.trim()}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-1.5 pb-0.5 pt-0.5">
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
          {card.category && (
            <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
              <span className="sr-only">{tCard("category")}: </span>
              {card.category}
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
              {start ? `${start} – ${due}` : due}
            </span>
          )}
          {time && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-[11px] tabular-nums",
                overEstimate
                  ? "font-medium text-destructive"
                  : "text-muted-foreground",
              )}
            >
              <Clock className="size-3" aria-hidden />
              {time}
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
      {card.stickers && card.stickers.length > 0 && (
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg"
          aria-hidden
        >
          {card.stickers.map((sticker) => (
            <img
              key={sticker.id}
              src={sticker.imageUrl}
              alt=""
              draggable={false}
              className="absolute size-8 select-none object-contain"
              style={{
                insetInlineStart: `${sticker.x * 100}%`,
                top: `${sticker.y * 100}%`,
                zIndex: sticker.zIndex,
                transform: `translate(-50%, -50%) rotate(${sticker.rotate}deg)`,
              }}
            />
          ))}
        </div>
      )}
    </>
  );
}
