"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BoardColumn, Card, Label } from "@/types/domain";

export type BoardFilters = {
  assigneeId?: string;
  labelId?: string;
  priority?: string;
  due?: "overdue" | "week" | "none";
};

export function filterCards(
  cards: Card[],
  filters: BoardFilters,
): Card[] {
  const now = Date.now();
  const week = now + 7 * 24 * 60 * 60 * 1000;
  return cards.filter((card) => {
    if (
      filters.assigneeId &&
      !(card.assignees ?? []).some((a) => a.id === filters.assigneeId)
    ) {
      return false;
    }
    if (
      filters.labelId &&
      !(card.labels ?? []).some((l) => l.id === filters.labelId)
    ) {
      return false;
    }
    if (filters.priority && card.priority !== filters.priority) {
      return false;
    }
    if (filters.due === "overdue") {
      if (!card.dueDate || new Date(card.dueDate).getTime() >= now) return false;
    }
    if (filters.due === "week") {
      if (
        !card.dueDate ||
        new Date(card.dueDate).getTime() < now ||
        new Date(card.dueDate).getTime() > week
      ) {
        return false;
      }
    }
    if (filters.due === "none" && card.dueDate) return false;
    return true;
  });
}

export function filterColumns(
  columns: BoardColumn[],
  filters: BoardFilters,
): BoardColumn[] {
  const hasFilters = Object.values(filters).some(Boolean);
  if (!hasFilters) return columns;
  return columns.map((col) => ({
    ...col,
    cards: filterCards(col.cards ?? [], filters),
  }));
}

type BoardFiltersBarProps = {
  filters: BoardFilters;
  onChange: (next: BoardFilters) => void;
  members: { id: string; username: string }[];
  labels: Label[];
};

export function BoardFiltersBar({
  filters,
  onChange,
  members,
  labels,
}: BoardFiltersBarProps) {
  const t = useTranslations("boardViews");
  const tCard = useTranslations("card");

  const activeCount = useMemo(
    () => Object.values(filters).filter(Boolean).length,
    [filters],
  );

  return (
    <Popover>
    <PopoverTrigger asChild>
      <Button variant="outline" size="sm" className="cursor-pointer">
        <Filter className="size-3.5" />
        {t("filterPriority")}
        {activeCount > 0 && (
          <span className="rounded-md bg-primary/15 px-1.5 text-xs font-semibold text-primary">
            {activeCount}
          </span>
        )}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="flex w-64 flex-col gap-2" align="end">
      <Select
        value={filters.assigneeId ?? "all"}
        onValueChange={(v) =>
          onChange({
            ...filters,
            assigneeId: v === "all" ? undefined : v,
          })
        }
      >
        <SelectTrigger className="h-8 w-[140px] cursor-pointer">
          <SelectValue placeholder={t("filterAssignee")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("filterAll")}</SelectItem>
          {members.map((m) => (
            <SelectItem key={m.id} value={m.id}>
              {m.username}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.labelId ?? "all"}
        onValueChange={(v) =>
          onChange({
            ...filters,
            labelId: v === "all" ? undefined : v,
          })
        }
      >
        <SelectTrigger className="h-8 w-[140px] cursor-pointer">
          <SelectValue placeholder={t("filterLabel")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("filterAll")}</SelectItem>
          {labels.map((l) => (
            <SelectItem key={l.id} value={l.id}>
              {l.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.priority ?? "all"}
        onValueChange={(v) =>
          onChange({
            ...filters,
            priority: v === "all" ? undefined : v,
          })
        }
      >
        <SelectTrigger className="h-8 w-[120px] cursor-pointer">
          <SelectValue placeholder={t("filterPriority")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("filterAll")}</SelectItem>
          {(
            [
              ["LOW", tCard("priorityLow")],
              ["MEDIUM", tCard("priorityMedium")],
              ["HIGH", tCard("priorityHigh")],
              ["URGENT", tCard("priorityUrgent")],
            ] as const
          ).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.due ?? "all"}
        onValueChange={(v) =>
          onChange({
            ...filters,
            due:
              v === "all"
                ? undefined
                : (v as BoardFilters["due"]),
          })
        }
      >
        <SelectTrigger className="h-8 w-[130px] cursor-pointer">
          <SelectValue placeholder={t("filterDue")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("filterAll")}</SelectItem>
          <SelectItem value="overdue">{t("filterOverdue")}</SelectItem>
          <SelectItem value="week">{t("filterWeek")}</SelectItem>
          <SelectItem value="none">{t("filterNoDue")}</SelectItem>
        </SelectContent>
      </Select>

      {activeCount > 0 && (
        <Button
          size="sm"
          variant="ghost"
          className="cursor-pointer"
          onClick={() => onChange({})}
        >
          {t("clearFilters")}
        </Button>
      )}
    </PopoverContent>
    </Popover>
  );
}
