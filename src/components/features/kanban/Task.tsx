"use client";

import { useCallback, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  MessageSquare,
  Paperclip,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatAppDate } from "@/lib/date";
import { playCrumplePaper } from "@/lib/crumple-paper";
import type { Locale } from "@/i18n/config";
import type { Card, BoardColumn } from "@/types/domain";
import { PRIORITY_COLORS } from "./priority";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type TaskProps = {
  card: Card;
  columns: BoardColumn[];
  onOpen: (cardId: string) => void;
  onArchive: (card: Card) => void;
  onDelete: (card: Card) => void;
  onCopy: (card: Card) => void;
  onMoveTo: (card: Card, columnId: string) => void;
};

export function Task({
  card,
  columns,
  onOpen,
  onArchive,
  onDelete,
  onCopy,
  onMoveTo,
}: TaskProps) {
  const t = useTranslations("kanban");
  const tCard = useTranslations("card");
  const locale = useLocale() as Locale;
  const cardElRef = useRef<HTMLDivElement | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: { type: "card", card },
    disabled: isRemoving,
  });

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      cardElRef.current = node;
      setNodeRef(node);
    },
    [setNodeRef],
  );

  const removeWithCrumple = useCallback(
    (action: (c: Card) => void) => {
      if (isRemoving) return;
      const el = cardElRef.current;
      if (!el) {
        action(card);
        return;
      }
      setIsRemoving(true);
      void playCrumplePaper(el, {
        onComplete: () => action(card),
      }).catch(() => {
        setIsRemoving(false);
        action(card);
      });
    },
    [card, isRemoving],
  );

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const due = formatAppDate(card.dueDate, "d MMM", locale);

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
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={setRefs}
          style={style}
          {...attributes}
          {...listeners}
          role="button"
          tabIndex={0}
          onClick={() => {
            if (isRemoving) return;
            onOpen(card.id);
          }}
          onKeyDown={(e) => {
            if (isRemoving) return;
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onOpen(card.id);
            }
          }}
          className={cn(
            "group cursor-grab rounded-lg border border-border bg-card text-sm shadow-none transition-[box-shadow,opacity,border-color,transform] duration-150 hover:border-primary/30 hover:shadow-sm active:scale-[0.99] active:cursor-grabbing touch-manipulation",
            isDragging && "opacity-50 scale-105 shadow-md ring-2 ring-primary/30",
            isRemoving && "pointer-events-none",
          )}
        >
          {card.coverColor && (
            <div
              className="h-8 rounded-t-md"
              style={{ backgroundColor: card.coverColor }}
            />
          )}
          <div className="p-2 space-y-1.5">
            {card.labels && card.labels.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {card.labels.map((label) => (
                  <span
                    key={label.id}
                    title={label.name}
                    className="h-2 w-10 rounded-sm"
                    style={{ backgroundColor: label.color }}
                  />
                ))}
              </div>
            )}
            <p className="font-medium leading-snug">{card.title}</p>
            {card.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {card.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {card.priority && (
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                    PRIORITY_COLORS[card.priority],
                  )}
                >
                  {priorityLabel(card.priority)}
                </span>
              )}
              {card.category && (
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  {card.category}
                </span>
              )}
              {due && (
                <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
                  <Calendar className="size-3" />
                  {due}
                </span>
              )}
              {(card._count?.comments ?? 0) > 0 && (
                <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
                  <MessageSquare className="size-3" />
                  {card._count!.comments}
                </span>
              )}
              {(card._count?.attachments ?? 0) > 0 && (
                <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
                  <Paperclip className="size-3" />
                  {card._count!.attachments}
                </span>
              )}
              {card.assignees && card.assignees.length > 0 && (
                <div className="ms-auto flex -space-x-1.5 rtl:space-x-reverse">
                  {card.assignees.slice(0, 3).map((a) => (
                    <Avatar key={a.id} className="size-5 border border-background">
                      <AvatarFallback className="text-[9px]">
                        {a.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={() => onOpen(card.id)}>{t("openCard")}</ContextMenuItem>
        <ContextMenuItem onClick={() => onCopy(card)}>{t("copyCard")}</ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger>{t("moveTo")}</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            {columns
              .filter((c) => c.id !== card.columnId)
              .map((col) => (
                <ContextMenuItem
                  key={col.id}
                  onClick={() => onMoveTo(card, col.id)}
                >
                  {col.title}
                </ContextMenuItem>
              ))}
            {columns.filter((c) => c.id !== card.columnId).length === 0 && (
              <ContextMenuItem disabled>{t("noOtherColumns")}</ContextMenuItem>
            )}
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem
          disabled={isRemoving}
          onClick={() => removeWithCrumple(onArchive)}
        >
          {t("archiveCard")}
        </ContextMenuItem>
        <ContextMenuItem
          disabled={isRemoving}
          className="text-destructive focus:text-destructive"
          onClick={() => removeWithCrumple(onDelete)}
        >
          {t("deleteCard")}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
