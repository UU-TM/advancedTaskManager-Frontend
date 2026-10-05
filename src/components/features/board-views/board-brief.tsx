"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { boardsApi } from "@/lib/api";
import type { Board, BoardColumn, Card } from "@/types/domain";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

type Attention = {
  id: string;
  title: string;
  reason: "overdue" | "blocked" | "dueSoon" | "urgent" | "high";
};

function columnGroups(board: Board): BoardColumn[] {
  const columns = board.columns ?? [];
  if (columns.some((column) => column.cards && column.cards.length > 0)) {
    return columns;
  }
  const flat = board.cards ?? [];
  if (flat.length === 0) return columns;
  return columns.map((column) => ({
    ...column,
    cards: flat.filter((card) => card.columnId === column.id),
  }));
}

function dueTime(card: Card) {
  if (!card.dueDate) return null;
  const time = new Date(card.dueDate).getTime();
  return Number.isNaN(time) ? null : time;
}

function buildBrief(board: Board | undefined) {
  if (!board) return null;
  const columns = columnGroups(board);
  const cards = columns.flatMap((column) => column.cards ?? []);
  const now = Date.now();
  let overdue = 0;
  let dueSoon = 0;
  let blocked = 0;
  let unassigned = 0;
  const attention: Attention[] = [];

  for (const card of cards) {
    const due = dueTime(card);
    const isOverdue = due != null && due < now;
    const isSoon = due != null && !isOverdue && due < now + WEEK_MS;
    const isBlocked = !!card.isBlocked;
    const isUnassigned = (card.assignees?.length ?? 0) === 0;
    if (isOverdue) overdue += 1;
    if (isSoon) dueSoon += 1;
    if (isBlocked) blocked += 1;
    if (isUnassigned) unassigned += 1;

    const reason: Attention["reason"] | null = isOverdue
      ? "overdue"
      : isBlocked
        ? "blocked"
        : isSoon
          ? "dueSoon"
          : card.priority === "URGENT"
            ? "urgent"
            : card.priority === "HIGH"
              ? "high"
              : null;
    if (reason) attention.push({ id: card.id, title: card.title, reason });
  }

  const rank: Record<Attention["reason"], number> = {
    overdue: 0,
    blocked: 1,
    dueSoon: 2,
    urgent: 3,
    high: 4,
  };
  attention.sort((a, b) => rank[a.reason] - rank[b.reason]);

  return {
    total: cards.length,
    columns: columns.map((column) => ({
      id: column.id,
      title: column.title,
      count: column.cards?.length ?? 0,
    })),
    overdue,
    dueSoon,
    blocked,
    unassigned,
    attention: attention.slice(0, 8),
    more: Math.max(0, attention.length - 8),
  };
}

export function BoardBriefDialog({
  boardId,
  open,
  onOpenChange,
  onOpenCard,
}: {
  boardId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenCard: (cardId: string) => void;
}) {
  const t = useTranslations("brief");
  const tCommon = useTranslations("common");
  const query = useQuery({
    queryKey: ["board", boardId, "brief"],
    queryFn: () => boardsApi.get(boardId, { columns: true, cards: true }),
    enabled: open,
    staleTime: 15_000,
  });
  const brief = useMemo(() => buildBrief(query.data), [query.data]);

  const reasonLabel = (reason: Attention["reason"]) => {
    switch (reason) {
      case "overdue":
        return t("reasonOverdue");
      case "blocked":
        return t("reasonBlocked");
      case "dueSoon":
        return t("reasonDueSoon");
      case "urgent":
        return t("reasonUrgent");
      case "high":
        return t("reasonHigh");
    }
  };

  const stats = brief
    ? [
        brief.overdue > 0 && {
          key: "overdue",
          label: t("overdue", { count: brief.overdue }),
        },
        brief.dueSoon > 0 && {
          key: "dueSoon",
          label: t("dueSoon", { count: brief.dueSoon }),
        },
        brief.blocked > 0 && {
          key: "blocked",
          label: t("blocked", { count: brief.blocked }),
        },
        brief.unassigned > 0 && {
          key: "unassigned",
          label: t("unassigned", { count: brief.unassigned }),
        },
      ].filter((item): item is { key: string; label: string } => !!item)
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("boardTitle")}</DialogTitle>
        </DialogHeader>

        {query.isLoading && (
          <p className="text-sm text-muted-foreground">{tCommon("loading")}</p>
        )}
        {query.isError && (
          <p className="text-sm text-destructive">{t("loadFailed")}</p>
        )}
        {brief && brief.total === 0 && (
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        )}
        {brief && brief.total > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t("cards", { count: brief.total })}
            </p>
            <ul className="grid grid-cols-2 gap-1.5">
              {brief.columns.map((column) => (
                <li
                  key={column.id}
                  className="flex items-center justify-between gap-2 rounded-md bg-muted/60 px-2.5 py-1.5 text-sm"
                >
                  <span className="truncate">{column.title}</span>
                  <span className="tabular-nums font-medium">{column.count}</span>
                </li>
              ))}
            </ul>
            {stats.length > 0 && (
              <ul className="flex flex-wrap gap-1.5">
                {stats.map((stat) => (
                  <li
                    key={stat.key}
                    className="rounded-md bg-muted px-2 py-1 text-xs font-medium"
                  >
                    {stat.label}
                  </li>
                ))}
              </ul>
            )}
            {brief.attention.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">
                  {t("attention")}
                </p>
                <ul className="space-y-1">
                  {brief.attention.map((card) => (
                    <li key={card.id}>
                      <button
                        type="button"
                        className="flex w-full cursor-pointer items-baseline justify-between gap-3 rounded-md px-2 py-1.5 text-start text-sm hover:bg-muted"
                        onClick={() => {
                          onOpenChange(false);
                          onOpenCard(card.id);
                        }}
                      >
                        <span className="truncate font-medium">{card.title}</span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {reasonLabel(card.reason)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                {brief.more > 0 && (
                  <p className="px-2 text-xs text-muted-foreground">
                    {t("andMore", { count: brief.more })}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
