"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  LayoutDashboard,
  Layers,
  UserX,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useBoardDashboard } from "@/hooks/use-board-dashboard";
import { cn } from "@/lib/utils";

type BoardDashboardViewProps = {
  boardId: string;
};

function Tile({
  icon,
  label,
  value,
  tone = "default",
}: {
  icon: ReactNode;
  label: string;
  value: number;
  tone?: "default" | "danger" | "warn" | "ok";
}) {
  return (
    <div
      className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4"
      style={{ boxShadow: "var(--kanban-list-shadow)" }}
    >
      <div
        className={cn(
          "flex size-8 items-center justify-center rounded-md",
          tone === "default" && "bg-primary/10 text-primary",
          tone === "danger" && "bg-destructive/10 text-destructive",
          tone === "warn" && "bg-amber-500/15 text-amber-600 dark:text-amber-400",
          tone === "ok" && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
        )}
      >
        {icon}
      </div>
      <p className="text-3xl font-semibold tabular-nums tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      className="rounded-lg border border-border bg-card p-4"
      style={{ boxShadow: "var(--kanban-list-shadow)" }}
    >
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      {children}
    </section>
  );
}

function BarRow({
  label,
  value,
  max,
  color,
  extra,
}: {
  label: ReactNode;
  value: number;
  max: number;
  color?: string;
  extra?: ReactNode;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <li className="space-y-1">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="min-w-0 flex-1 truncate">{label}</span>
        {extra}
        <span className="shrink-0 font-medium tabular-nums">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300"
          style={{ width: `${pct}%`, ...(color ? { backgroundColor: color } : {}) }}
        />
      </div>
    </li>
  );
}

export function BoardDashboardView({ boardId }: BoardDashboardViewProps) {
  const t = useTranslations("boardViews");
  const { data, isLoading, isError } = useBoardDashboard(boardId);

  if (isLoading) {
    return (
      <div className="grid gap-4 p-4 md:p-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <EmptyState
        icon={LayoutDashboard}
        variant="error"
        title={t("dashboardError")}
        className="h-full"
      />
    );
  }

  const { totals } = data;
  const completion =
    totals.cards > 0 ? Math.round((totals.completed / totals.cards) * 100) : 0;
  const maxColumn = Math.max(0, ...data.byColumn.map((c) => c.count));
  const maxLabel = Math.max(0, ...data.byLabel.map((l) => l.count));
  const maxMember = Math.max(0, ...data.byMember.map((m) => m.count));

  return (
    <div className="h-full space-y-4 overflow-y-auto p-4 md:p-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tile
          icon={<Layers className="size-4" />}
          label={t("dashTotalCards")}
          value={totals.cards}
        />
        <Tile
          icon={<AlertTriangle className="size-4" />}
          label={t("dashOverdue")}
          value={totals.overdue}
          tone="danger"
        />
        <Tile
          icon={<CalendarClock className="size-4" />}
          label={t("dashDueSoon")}
          value={totals.dueSoon}
          tone="warn"
        />
        <Tile
          icon={<UserX className="size-4" />}
          label={t("dashUnassigned")}
          value={totals.unassigned}
        />
      </div>

      <div
        className="flex items-center gap-4 rounded-lg border border-border bg-card p-4"
        style={{ boxShadow: "var(--kanban-list-shadow)" }}
      >
        <CheckCircle2 className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">{t("dashCompleted")}</span>
            <span className="tabular-nums text-muted-foreground">
              {totals.completed} / {totals.cards} · {completion}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-emerald-500 transition-[width] duration-300"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>
        <div className="hidden text-xs text-muted-foreground sm:block">
          {t("dashNoDue", { count: totals.noDueDate })}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title={t("dashByList")}>
          {data.byColumn.length === 0 ? (
            <p className="text-xs text-muted-foreground">{t("dashEmpty")}</p>
          ) : (
            <ul className="space-y-3">
              {data.byColumn.map((c) => (
                <BarRow
                  key={c.columnId}
                  label={c.title}
                  value={c.count}
                  max={maxColumn}
                />
              ))}
            </ul>
          )}
        </Panel>

        <Panel title={t("dashByLabel")}>
          {data.byLabel.length === 0 ? (
            <p className="text-xs text-muted-foreground">{t("dashEmpty")}</p>
          ) : (
            <ul className="space-y-3">
              {data.byLabel.map((l) => (
                <BarRow
                  key={l.labelId}
                  label={l.name || t("dashUnnamedLabel")}
                  value={l.count}
                  max={maxLabel}
                  color={l.color}
                />
              ))}
            </ul>
          )}
        </Panel>

        <Panel title={t("dashByMember")}>
          {data.byMember.length === 0 ? (
            <p className="text-xs text-muted-foreground">{t("dashEmpty")}</p>
          ) : (
            <ul className="space-y-3">
              {data.byMember.map((m) => (
                <BarRow
                  key={m.userId}
                  label={m.username}
                  value={m.count}
                  max={maxMember}
                  extra={
                    m.overdue > 0 ? (
                      <span className="shrink-0 rounded bg-destructive/10 px-1.5 text-[10px] font-medium text-destructive">
                        {t("dashOverdueCount", { count: m.overdue })}
                      </span>
                    ) : null
                  }
                />
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
