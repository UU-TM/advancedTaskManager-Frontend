"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Filter, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label as FieldLabel } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
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
  keyword?: string;
  noLabels?: boolean;
  assignedToMe?: boolean;
};

export function filterCards(
  cards: Card[],
  filters: BoardFilters,
  meId?: string,
): Card[] {
  const now = Date.now();
  const week = now + 7 * 24 * 60 * 60 * 1000;
  const keyword = filters.keyword?.trim().toLowerCase();
  return cards.filter((card) => {
    if (keyword) {
      const haystack = `${card.title} ${card.description ?? ""}`.toLowerCase();
      if (!haystack.includes(keyword)) return false;
    }
    if (filters.noLabels && (card.labels ?? []).length > 0) return false;
    if (filters.assignedToMe) {
      if (!meId) return false;
      if (!(card.assignees ?? []).some((a) => a.id === meId)) return false;
    }
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
  meId?: string,
): BoardColumn[] {
  const hasFilters = Object.values(filters).some(
    (v) => (typeof v === "string" ? v.trim() !== "" : Boolean(v)),
  );
  if (!hasFilters) return columns;
  return columns.map((col) => ({
    ...col,
    cards: filterCards(col.cards ?? [], filters, meId),
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

  const { user: me } = useAuth();

  const activeCount = useMemo(
    () =>
      Object.values(filters).filter((v) =>
        typeof v === "string" ? v.trim() !== "" : Boolean(v),
      ).length,
    [filters],
  );

  return (
    <Popover>
    <PopoverTrigger asChild>
      <Button variant="outline" size="sm" className="cursor-pointer">
        <Filter className="size-3.5" />
        {t("filterPriority")}
        {activeCount > 0 && (
          <span className="rounded bg-foreground px-1.5 text-xs font-semibold text-background">
            {activeCount}
          </span>
        )}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="flex w-72 flex-col gap-2" align="end">
      <div className="relative">
        <Search className="pointer-events-none absolute start-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.keyword ?? ""}
          onChange={(e) =>
            onChange({ ...filters, keyword: e.target.value || undefined })
          }
          placeholder={t("filterKeyword")}
          aria-label={t("filterKeyword")}
          className="h-8 ps-7 pe-7"
        />
        {filters.keyword && (
          <button
            type="button"
            className="absolute end-1.5 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
            aria-label={t("clearFilters")}
            onClick={() => onChange({ ...filters, keyword: undefined })}
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 rounded-md border border-border px-2 py-1.5">
        <FieldLabel htmlFor="filter-assigned-me" className="cursor-pointer text-xs font-normal">
          {t("filterAssignedToMe")}
        </FieldLabel>
        <Switch
          id="filter-assigned-me"
          checked={!!filters.assignedToMe}
          disabled={!me}
          onCheckedChange={(on) =>
            onChange({ ...filters, assignedToMe: on || undefined })
          }
        />
      </div>

      <div className="flex items-center justify-between gap-2 rounded-md border border-border px-2 py-1.5">
        <FieldLabel htmlFor="filter-no-labels" className="cursor-pointer text-xs font-normal">
          {t("filterNoLabels")}
        </FieldLabel>
        <Switch
          id="filter-no-labels"
          checked={!!filters.noLabels}
          onCheckedChange={(on) =>
            onChange({ ...filters, noLabels: on || undefined })
          }
        />
      </div>

      <Select
        value={filters.assigneeId ?? "all"}
        onValueChange={(v) =>
          onChange({
            ...filters,
            assigneeId: v === "all" ? undefined : v,
          })
        }
      >
        <SelectTrigger className="h-8 w-full cursor-pointer">
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
        <SelectTrigger className="h-8 w-full cursor-pointer">
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
        <SelectTrigger className="h-8 w-full cursor-pointer">
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
        <SelectTrigger className="h-8 w-full cursor-pointer">
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
