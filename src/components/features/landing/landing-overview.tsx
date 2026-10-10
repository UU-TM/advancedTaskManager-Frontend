"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Columns3,
  Layers,
  LayoutDashboard,
  Table2,
  UserX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DONE_COLUMN_ID,
  INITIAL_CARDS,
  INITIAL_COLUMNS,
  LABEL_COLORS,
  LandingKanban,
  dueKind,
  useDemoBoardCopy,
  type DemoCard,
  type DemoColumn,
  type LabelKey,
  type MemberKey,
} from "./landing-kanban";

type View = "board" | "table" | "dashboard";

export function LandingOverview() {
  const t = useTranslations("home");
  const views = useTranslations("boardViews");
  const copy = useDemoBoardCopy();
  const [view, setView] = useState<View>("board");
  const [columns, setColumns] = useState<DemoColumn[]>(INITIAL_COLUMNS);
  const [cards, setCards] = useState<DemoCard[]>(INITIAL_CARDS);
  const [selected, setSelected] = useState<string[]>([]);
  const [sort, setSort] = useState<{ key: "title" | "list"; desc: boolean } | null>(
    null,
  );

  const columnTitle = (id: string) => {
    const column = columns.find((item) => item.id === id);
    return column ? copy.columnTitle(column) : "";
  };

  const stats = useMemo(() => {
    const open = cards.filter((card) => card.columnId !== DONE_COLUMN_ID);
    const byList = columns.map((column) => ({
      key: column.id,
      count: cards.filter((card) => card.columnId === column.id).length,
    }));
    const byLabel = (["0", "1", "2"] as LabelKey[]).map((key) => ({
      key,
      count: cards.filter((card) => card.labels.includes(key)).length,
      color: LABEL_COLORS[key],
    }));
    const byMember = (["0", "1"] as MemberKey[]).map((key) => ({
      key,
      count: cards.filter((card) => card.member === key).length,
      overdue: cards.filter(
        (card) =>
          card.member === key &&
          dueKind(card.dueDate) === "overdue" &&
          card.columnId !== DONE_COLUMN_ID,
      ).length,
    }));
    return {
      total: cards.length,
      overdue: open.filter((card) => dueKind(card.dueDate) === "overdue").length,
      dueSoon: open.filter((card) => dueKind(card.dueDate) === "soon").length,
      unassigned: cards.filter((card) => card.member === null).length,
      completed: cards.filter((card) => card.columnId === DONE_COLUMN_ID).length,
      noDue: cards.filter((card) => !card.dueDate).length,
      byList,
      byLabel,
      byMember,
      maxList: Math.max(1, ...byList.map((row) => row.count)),
      maxLabel: Math.max(1, ...byLabel.map((row) => row.count)),
      maxMember: Math.max(1, ...byMember.map((row) => row.count)),
    };
  }, [cards, columns]);

  const tableRows = [...cards].sort((a, b) => {
    if (!sort) return 0;
    const av = sort.key === "title" ? copy.titleOf(a) : columnTitle(a.columnId);
    const bv = sort.key === "title" ? copy.titleOf(b) : columnTitle(b.columnId);
    const cmp = av.localeCompare(bv);
    return sort.desc ? -cmp : cmp;
  });

  const tabs: { id: View; icon: typeof Columns3; label: string }[] = [
    { id: "board", icon: Columns3, label: views("kanban") },
    { id: "table", icon: Table2, label: views("table") },
    { id: "dashboard", icon: LayoutDashboard, label: views("dashboard") },
  ];

  return (
    <div className="relative px-4 pb-16 pt-4 md:px-8 md:pb-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[-8%] top-6 h-[78%] dark:opacity-40 md:inset-x-[-12%]"
      >
        <svg
          viewBox="0 0 1440 640"
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          <defs>
            <linearGradient id="wm-wash" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#C4B5FD" />
              <stop offset="22%" stopColor="#C9BDFD" stopOpacity="0.84" />
              <stop offset="50%" stopColor="#DBEAFE" stopOpacity="0.42" />
              <stop offset="78%" stopColor="#99F6E4" stopOpacity="0.84" />
              <stop offset="100%" stopColor="#99F6E4" />
            </linearGradient>
          </defs>
          <path
            fill="url(#wm-wash)"
            d="M0 210C180 90 360 250 560 170C760 90 980 40 1200 130C1320 180 1400 160 1440 140V470C1280 560 1080 420 860 500C640 580 380 520 180 470C80 440 0 460 0 460Z"
          />
        </svg>
      </div>

      <div className="wm-rise relative mx-auto w-full max-w-[1088px] overflow-hidden rounded-[18px] bg-card text-card-foreground shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_24px_60px_-28px_rgba(0,0,0,0.28),0_40px_90px_-48px_rgba(0,0,0,0.36)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_24px_60px_-28px_rgba(0,0,0,0.55)]">
        <div className="flex items-center gap-3 border-b border-border px-3 py-2.5 md:px-4">
          <p className="truncate text-sm font-semibold">{t("hero.board.name")}</p>
          <div
            role="tablist"
            aria-label={t("hero.board.name")}
            className="flex h-8 items-center gap-0.5 rounded-lg bg-muted p-0.5"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = view === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setView(tab.id)}
                  className={cn(
                    "inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 text-xs",
                    active
                      ? "bg-background font-medium shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="size-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
          <p className="ms-auto hidden text-[11px] text-muted-foreground sm:block">
            {t("hero.board.label")}
          </p>
        </div>

        <div className="relative min-h-[460px]">
          {view === "board" && (
            <LandingKanban
              columns={columns}
              cards={cards}
              setColumns={setColumns}
              setCards={setCards}
            />
          )}

          {view === "table" && (
            <div className="overflow-x-auto p-3 md:p-4">
              <table className="w-full min-w-[640px] text-start text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="w-8 px-2 py-2" />
                    <SortHeader
                      label={views("colTitle")}
                      active={sort?.key === "title"}
                      desc={sort?.key === "title" ? sort.desc : false}
                      onClick={() =>
                        setSort((current) =>
                          current?.key === "title"
                            ? { key: "title", desc: !current.desc }
                            : { key: "title", desc: false },
                        )
                      }
                    />
                    <SortHeader
                      label={views("colList")}
                      active={sort?.key === "list"}
                      desc={sort?.key === "list" ? sort.desc : false}
                      onClick={() =>
                        setSort((current) =>
                          current?.key === "list"
                            ? { key: "list", desc: !current.desc }
                            : { key: "list", desc: false },
                        )
                      }
                    />
                    <th className="px-2 py-2 font-medium">{views("colLabels")}</th>
                    <th className="px-2 py-2 font-medium">{views("colAssignees")}</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((card) => (
                    <tr key={card.id} className="border-b border-border">
                      <td className="px-2 py-2">
                        <input
                          type="checkbox"
                          checked={selected.includes(card.id)}
                          aria-label={copy.titleOf(card)}
                          onChange={() =>
                            setSelected((current) =>
                              current.includes(card.id)
                                ? current.filter((id) => id !== card.id)
                                : [...current, card.id],
                            )
                          }
                          className="size-3.5 accent-[#357dff]"
                        />
                      </td>
                      <td className="px-2 py-2 font-medium">{copy.titleOf(card)}</td>
                      <td className="px-2 py-2 text-muted-foreground">{columnTitle(card.columnId)}</td>
                      <td className="px-2 py-2 text-muted-foreground">
                        {card.labels.map(copy.labelName).join(", ") || "—"}
                      </td>
                      <td className="px-2 py-2 text-muted-foreground">
                        {card.member ? copy.memberName(card.member) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {view === "dashboard" && (
            <div className="space-y-4 px-4 py-4 md:px-5 md:py-5">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Tile icon={Layers} label={views("dashTotalCards")} value={stats.total} />
                <Tile
                  icon={AlertTriangle}
                  label={views("dashOverdue")}
                  value={stats.overdue}
                  tone="danger"
                />
                <Tile
                  icon={CalendarClock}
                  label={views("dashDueSoon")}
                  value={stats.dueSoon}
                  tone="warn"
                />
                <Tile
                  icon={UserX}
                  label={views("dashUnassigned")}
                  value={stats.unassigned}
                />
              </div>

              <div className="flex items-center gap-4 rounded-lg border border-border p-4">
                <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{views("dashCompleted")}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {stats.completed} / {stats.total} ·{" "}
                      {stats.total
                        ? Math.round((stats.completed / stats.total) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{
                        width: `${stats.total ? (stats.completed / stats.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
                <p className="hidden text-xs text-muted-foreground sm:block">
                  {views("dashNoDue", { count: stats.noDue })}
                </p>
              </div>

              <div className="grid gap-3 lg:grid-cols-3">
                <Panel title={views("dashByList")}>
                  <ul className="space-y-3">
                    {stats.byList.map((row) => (
                      <BarRow
                        key={row.key}
                        label={columnTitle(row.key)}
                        value={row.count}
                        max={stats.maxList}
                      />
                    ))}
                  </ul>
                </Panel>
                <Panel title={views("dashByLabel")}>
                  <ul className="space-y-3">
                    {stats.byLabel.map((row) => (
                      <BarRow
                        key={row.key}
                        label={copy.labelName(row.key)}
                        value={row.count}
                        max={stats.maxLabel}
                        color={row.color}
                      />
                    ))}
                  </ul>
                </Panel>
                <Panel title={views("dashByMember")}>
                  <ul className="space-y-3">
                    {stats.byMember.map((row) => (
                      <BarRow
                        key={row.key}
                        label={copy.memberName(row.key)}
                        value={row.count}
                        max={stats.maxMember}
                        extra={
                          row.overdue > 0
                            ? views("dashOverdueCount", { count: row.overdue })
                            : undefined
                        }
                      />
                    ))}
                  </ul>
                </Panel>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SortHeader({
  label,
  active,
  desc,
  onClick,
}: {
  label: string;
  active: boolean;
  desc: boolean;
  onClick: () => void;
}) {
  return (
    <th className="px-2 py-2 text-start font-medium">
      <button
        type="button"
        onClick={onClick}
        className="cursor-pointer hover:text-foreground"
      >
        {label}
        {active ? (desc ? " ↓" : " ↑") : ""}
      </button>
    </th>
  );
}

function Tile({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: typeof Layers;
  label: string;
  value: number;
  tone?: "default" | "danger" | "warn";
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border p-4">
      <span
        className={
          tone === "danger"
            ? "flex size-8 items-center justify-center rounded-md bg-red-500/10 text-red-600"
            : tone === "warn"
              ? "flex size-8 items-center justify-center rounded-md bg-amber-500/15 text-amber-600"
              : "flex size-8 items-center justify-center rounded-md bg-[#357dff]/10 text-[#357dff]"
        }
      >
        <Icon className="size-4" />
      </span>
      <p className="font-display text-3xl font-semibold tabular-nums leading-none tracking-tight">
        {value}
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-border p-4">
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
  label: string;
  value: number;
  max: number;
  color?: string;
  extra?: string;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <li className="space-y-1">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="min-w-0 flex-1 truncate">{label}</span>
        {extra ? (
          <span className="shrink-0 rounded bg-red-500/10 px-1.5 text-[10px] font-medium text-red-600">
            {extra}
          </span>
        ) : null}
        <span className="shrink-0 font-medium tabular-nums">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-[#357dff]"
          style={{ width: `${pct}%`, ...(color ? { backgroundColor: color } : {}) }}
        />
      </div>
    </li>
  );
}
