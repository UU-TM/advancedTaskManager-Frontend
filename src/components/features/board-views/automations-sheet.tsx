"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  CalendarClock,
  MousePointerClick,
  Play,
  Plus,
  Square,
  Trash2,
  Workflow,
  Zap,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDelete } from "@/components/ui/confirm-delete";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAutomations,
  useCreateAutomation,
  useDeleteAutomation,
  useRunAutomation,
  useUpdateAutomation,
} from "@/hooks/use-automations";
import { useBoardLabels, useBoardMembers } from "@/hooks/use-kanban-extras";
import type {
  AutomationKind,
  AutomationSchedule,
  AutomationTriggerType,
  BoardAutomation,
  BoardColumn,
} from "@/types/domain";
import {
  ButlerActionBuilder,
  draftToAction,
  isActionValid,
  newActionDraft,
  type ActionDraft,
  type ActionScope,
} from "./butler-action-builder";

type AutomationsSheetProps = {
  boardId: string;
  columns: BoardColumn[];
  /** Controlled open state (e.g. from the board menu). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Hide the built-in header trigger button. */
  hideTrigger?: boolean;
};

type ButlerTab = "rules" | "cardButtons" | "boardButtons" | "calendar";

const RULE_TRIGGERS: AutomationTriggerType[] = [
  "CARD_MOVED",
  "CARD_ASSIGNED",
  "CHECKLIST_COMPLETE",
  "DUE_SOON",
  "GITHUB_PR_MERGED",
];

const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6] as const;

function defaultTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export function AutomationsSheet({
  boardId,
  columns,
  open,
  onOpenChange,
  hideTrigger,
}: AutomationsSheetProps) {
  const t = useTranslations("butler");
  const tAuto = useTranslations("automations");
  const { data: automations = [] } = useAutomations(boardId);
  const { data: labels = [] } = useBoardLabels(boardId);
  const { data: boardMembers = [] } = useBoardMembers(boardId);
  const create = useCreateAutomation(boardId);
  const update = useUpdateAutomation(boardId);
  const remove = useDeleteAutomation(boardId);
  const run = useRunAutomation(boardId);

  const [tab, setTab] = useState<ButlerTab>("rules");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const members = useMemo(
    () =>
      boardMembers.map((m) => ({
        id: m.userId,
        username: m.user?.username ?? m.userId.slice(0, 6),
      })),
    [boardMembers],
  );

  const byKind = useMemo(() => {
    const groups: Record<AutomationKind, BoardAutomation[]> = {
      RULE: [],
      CARD_BUTTON: [],
      BOARD_BUTTON: [],
      CALENDAR: [],
    };
    for (const a of automations) groups[a.kind ?? "RULE"].push(a);
    return groups;
  }, [automations]);

  function summarize(a: BoardAutomation): string {
    const parts = a.actions.map((action) => {
      const label = t(`action.${action.type}`);
      const target =
        columns.find((c) => c.id === action.columnId)?.title ??
        labels.find((l) => l.id === action.labelId)?.name ??
        members.find((m) => m.id === action.userId)?.username ??
        null;
      return target ? `${label}: ${target}` : label;
    });
    return parts.join(" → ");
  }

  function whenText(a: BoardAutomation): string {
    if (a.kind === "CALENDAR" && a.schedule) {
      const s = a.schedule;
      const time = `${String(s.hour).padStart(2, "0")}:${String(s.minute ?? 0).padStart(2, "0")}`;
      if (s.frequency === "WEEKLY")
        return t("scheduleWeekly", { day: t(`weekday.${s.weekday ?? 1}`), time });
      if (s.frequency === "MONTHLY")
        return t("scheduleMonthly", { day: s.dayOfMonth ?? 1, time });
      return t("scheduleDaily", { time });
    }
    if (a.kind === "CARD_BUTTON") return t("onCard");
    if (a.kind === "BOARD_BUTTON") return t("onBoard");
    const type = a.trigger?.type;
    const col = columns.find((c) => c.id === a.trigger?.columnId)?.title;
    const base = type
      ? ({
          CARD_MOVED: tAuto("trigMoved"),
          CARD_ASSIGNED: tAuto("trigAssigned"),
          CHECKLIST_COMPLETE: tAuto("trigChecklist"),
          DUE_SOON: tAuto("trigDueSoon"),
          GITHUB_PR_MERGED: tAuto("trigPrMerged"),
        } as Record<string, string>)[type] ?? type
      : "";
    return col ? `${base} · ${col}` : base;
  }

  function submit(
    payload: {
      kind: AutomationKind;
      name: string;
      actions: ActionDraft[];
      trigger?: BoardAutomation["trigger"];
      schedule?: AutomationSchedule;
      buttonLabel?: string;
    },
    reset: () => void,
  ) {
    if (!payload.name.trim()) {
      toast.error(tAuto("nameRequired"));
      return;
    }
    if (payload.actions.length === 0 || !payload.actions.every(isActionValid)) {
      toast.error(t("actionsIncomplete"));
      return;
    }
    create.mutate(
      {
        kind: payload.kind,
        name: payload.name.trim(),
        enabled: true,
        trigger: payload.trigger,
        conditions: null,
        actions: payload.actions.map(draftToAction),
        schedule: payload.schedule ?? null,
        buttonLabel: payload.buttonLabel ?? null,
      },
      {
        onSuccess: () => {
          toast.success(tAuto("created"));
          reset();
        },
        onError: () => toast.error(tAuto("createFailed")),
      },
    );
  }

  function renderList(items: BoardAutomation[], opts?: { runnable?: boolean }) {
    if (items.length === 0) {
      return (
        <EmptyState
          icon={Zap}
          title={tAuto("emptyTitle")}
          description={t("emptyTab")}
          className="py-8"
        />
      );
    }
    return (
      <ul className="space-y-2">
        {items.map((a) => (
          <li
            key={a.id}
            className="flex items-start gap-2 rounded-lg border border-border bg-card p-3"
          >
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="truncate text-sm font-medium">
                {a.buttonLabel || a.name}
              </p>
              {a.buttonLabel && a.buttonLabel !== a.name && (
                <p className="truncate text-xs text-muted-foreground">{a.name}</p>
              )}
              <p className="text-xs text-muted-foreground">{whenText(a)}</p>
              <p className="text-xs text-muted-foreground/80">{summarize(a)}</p>
            </div>
            {opts?.runnable && (
              <Button
                size="sm"
                className="cursor-pointer"
                disabled={run.isPending}
                onClick={() =>
                  run.mutate(
                    { id: a.id },
                    {
                      onSuccess: (res) =>
                        toast.success(t("ran", { count: res.actionsRun })),
                      onError: () => toast.error(t("runFailed")),
                    },
                  )
                }
              >
                <Play className="me-1 size-3.5" />
                {t("run")}
              </Button>
            )}
            <Switch
              checked={a.enabled}
              aria-label={t("enabled")}
              onCheckedChange={(enabled) => update.mutate({ id: a.id, enabled })}
            />
            <Button
              size="icon-sm"
              variant="ghost"
              className="cursor-pointer text-destructive"
              aria-label={tAuto("deleted")}
              onClick={() => setDeleteId(a.id)}
            >
              <Trash2 className="size-4" />
            </Button>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {!hideTrigger && (
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon-sm"
            className="cursor-pointer"
            aria-label={t("title")}
            title={t("title")}
          >
            <Zap className="size-4" />
          </Button>
        </SheetTrigger>
      )}
      <SheetContent className="w-full gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="border-b border-border">
          <SheetTitle className="flex items-center gap-2">
            <Zap className="size-4 text-primary" />
            {t("title")}
          </SheetTitle>
          <SheetDescription>{t("subtitle")}</SheetDescription>
        </SheetHeader>

        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as ButlerTab)}
          className="min-h-0 flex-1 gap-0"
        >
          <div className="border-b border-border px-4 py-2">
            <TabsList className="grid h-auto w-full grid-cols-4">
              <TabsTrigger value="rules" className="cursor-pointer gap-1 px-1 text-xs">
                <Workflow className="size-3.5" />
                <span className="truncate">{t("tabRules")}</span>
              </TabsTrigger>
              <TabsTrigger value="cardButtons" className="cursor-pointer gap-1 px-1 text-xs">
                <MousePointerClick className="size-3.5" />
                <span className="truncate">{t("tabCardButtons")}</span>
              </TabsTrigger>
              <TabsTrigger value="boardButtons" className="cursor-pointer gap-1 px-1 text-xs">
                <Square className="size-3.5" />
                <span className="truncate">{t("tabBoardButtons")}</span>
              </TabsTrigger>
              <TabsTrigger value="calendar" className="cursor-pointer gap-1 px-1 text-xs">
                <CalendarClock className="size-3.5" />
                <span className="truncate">{t("tabCalendar")}</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <TabsContent value="rules" className="mt-0 space-y-4 p-4">
              <RuleForm
                columns={columns}
                labels={labels}
                members={members}
                pending={create.isPending}
                onSubmit={submit}
              />
              {renderList(byKind.RULE)}
            </TabsContent>

            <TabsContent value="cardButtons" className="mt-0 space-y-4 p-4">
              <ButtonForm
                kind="CARD_BUTTON"
                columns={columns}
                labels={labels}
                members={members}
                pending={create.isPending}
                onSubmit={submit}
              />
              {renderList(byKind.CARD_BUTTON)}
            </TabsContent>

            <TabsContent value="boardButtons" className="mt-0 space-y-4 p-4">
              <ButtonForm
                kind="BOARD_BUTTON"
                columns={columns}
                labels={labels}
                members={members}
                pending={create.isPending}
                onSubmit={submit}
              />
              {renderList(byKind.BOARD_BUTTON, { runnable: true })}
            </TabsContent>

            <TabsContent value="calendar" className="mt-0 space-y-4 p-4">
              <CalendarForm
                columns={columns}
                labels={labels}
                members={members}
                pending={create.isPending}
                onSubmit={submit}
              />
              {renderList(byKind.CALENDAR)}
            </TabsContent>
          </div>
        </Tabs>
      </SheetContent>

      <ConfirmDelete
        open={deleteId != null}
        onOpenChange={(next) => {
          if (!next) setDeleteId(null);
        }}
        onConfirm={() => {
          if (!deleteId) return;
          remove.mutate(deleteId, {
            onSuccess: () => toast.success(tAuto("deleted")),
          });
          setDeleteId(null);
        }}
      />
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/* Forms                                                              */
/* ------------------------------------------------------------------ */

type SubmitFn = (
  payload: {
    kind: AutomationKind;
    name: string;
    actions: ActionDraft[];
    trigger?: BoardAutomation["trigger"];
    schedule?: AutomationSchedule;
    buttonLabel?: string;
  },
  reset: () => void,
) => void;

type FormCommon = {
  columns: BoardColumn[];
  labels: import("@/types/domain").Label[];
  members: { id: string; username: string }[];
  pending: boolean;
  onSubmit: SubmitFn;
};

function FormShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-3">
      <p className="text-sm font-medium">{title}</p>
      {children}
    </div>
  );
}

function RuleForm({ columns, labels, members, pending, onSubmit }: FormCommon) {
  const t = useTranslations("butler");
  const tAuto = useTranslations("automations");
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState<AutomationTriggerType>("CARD_MOVED");
  const [triggerColumnId, setTriggerColumnId] = useState("");
  const [actions, setActions] = useState<ActionDraft[]>(() => [newActionDraft()]);

  const triggerLabels: Record<string, string> = {
    CARD_MOVED: tAuto("trigMoved"),
    CARD_ASSIGNED: tAuto("trigAssigned"),
    CHECKLIST_COMPLETE: tAuto("trigChecklist"),
    DUE_SOON: tAuto("trigDueSoon"),
    GITHUB_PR_MERGED: tAuto("trigPrMerged"),
  };

  return (
    <FormShell title={tAuto("newRule")}>
      <div className="space-y-1.5">
        <Label>{tAuto("name")}</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={tAuto("namePlaceholder")}
        />
      </div>
      <div className="space-y-1.5">
        <Label>{tAuto("when")}</Label>
        <Select
          value={trigger}
          onValueChange={(v) => setTrigger(v as AutomationTriggerType)}
        >
          <SelectTrigger className="cursor-pointer">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RULE_TRIGGERS.map((type) => (
              <SelectItem key={type} value={type}>
                {triggerLabels[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {trigger === "CARD_MOVED" && (
          <Select
            value={triggerColumnId || "any"}
            onValueChange={(v) => setTriggerColumnId(v === "any" ? "" : v)}
          >
            <SelectTrigger className="cursor-pointer">
              <SelectValue placeholder={tAuto("anyColumn")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">{tAuto("anyColumn")}</SelectItem>
              {columns.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <div className="space-y-1.5">
        <Label>{tAuto("then")}</Label>
        <ButlerActionBuilder
          scope="rule"
          actions={actions}
          onChange={setActions}
          columns={columns}
          labels={labels}
          members={members}
        />
      </div>
      <Button
        className="w-full cursor-pointer"
        disabled={pending}
        onClick={() =>
          onSubmit(
            {
              kind: "RULE",
              name,
              actions,
              trigger: {
                type: trigger,
                ...(trigger === "CARD_MOVED" && triggerColumnId
                  ? { columnId: triggerColumnId }
                  : {}),
                ...(trigger === "DUE_SOON" ? { hoursBeforeDue: 24 } : {}),
              },
            },
            () => {
              setName("");
              setTriggerColumnId("");
              setActions([newActionDraft()]);
            },
          )
        }
      >
        <Plus className="me-2 size-4" />
        {t("addRule")}
      </Button>
    </FormShell>
  );
}

function ButtonForm({
  kind,
  columns,
  labels,
  members,
  pending,
  onSubmit,
}: FormCommon & { kind: "CARD_BUTTON" | "BOARD_BUTTON" }) {
  const t = useTranslations("butler");
  const scope: ActionScope = kind === "CARD_BUTTON" ? "card" : "board";
  const [name, setName] = useState("");
  const [buttonLabel, setButtonLabel] = useState("");
  const [actions, setActions] = useState<ActionDraft[]>(() => [newActionDraft()]);

  return (
    <FormShell
      title={kind === "CARD_BUTTON" ? t("newCardButton") : t("newBoardButton")}
    >
      <p className="text-xs text-muted-foreground">
        {kind === "CARD_BUTTON" ? t("cardButtonHint") : t("boardButtonHint")}
      </p>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label>{t("buttonName")}</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("buttonNamePlaceholder")}
          />
        </div>
        <div className="space-y-1.5">
          <Label>{t("buttonLabel")}</Label>
          <Input
            value={buttonLabel}
            onChange={(e) => setButtonLabel(e.target.value)}
            placeholder={t("buttonLabelPlaceholder")}
            maxLength={40}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>{t("actions")}</Label>
        <ButlerActionBuilder
          scope={scope}
          actions={actions}
          onChange={setActions}
          columns={columns}
          labels={labels}
          members={members}
        />
      </div>
      <Button
        className="w-full cursor-pointer"
        disabled={pending}
        onClick={() =>
          onSubmit(
            {
              kind,
              name,
              actions,
              trigger: { type: "MANUAL" },
              buttonLabel: buttonLabel.trim() || name.trim(),
            },
            () => {
              setName("");
              setButtonLabel("");
              setActions([newActionDraft()]);
            },
          )
        }
      >
        <Plus className="me-2 size-4" />
        {t("addButton")}
      </Button>
    </FormShell>
  );
}

function CalendarForm({ columns, labels, members, pending, onSubmit }: FormCommon) {
  const t = useTranslations("butler");
  const [name, setName] = useState("");
  const [frequency, setFrequency] =
    useState<AutomationSchedule["frequency"]>("DAILY");
  const [hour, setHour] = useState("9");
  const [minute, setMinute] = useState("0");
  const [weekday, setWeekday] = useState("1");
  const [dayOfMonth, setDayOfMonth] = useState("1");
  const [timezone, setTimezone] = useState(defaultTimezone);
  const [actions, setActions] = useState<ActionDraft[]>(() => [newActionDraft()]);

  function clamp(value: string, min: number, max: number): number {
    const n = Math.round(Number(value));
    if (!Number.isFinite(n)) return min;
    return Math.min(max, Math.max(min, n));
  }

  return (
    <FormShell title={t("newCalendar")}>
      <p className="text-xs text-muted-foreground">{t("calendarHint")}</p>
      <div className="space-y-1.5">
        <Label>{t("buttonName")}</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("calendarNamePlaceholder")}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label>{t("frequency")}</Label>
          <Select
            value={frequency}
            onValueChange={(v) => setFrequency(v as AutomationSchedule["frequency"])}
          >
            <SelectTrigger className="cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DAILY">{t("daily")}</SelectItem>
              <SelectItem value="WEEKLY">{t("weekly")}</SelectItem>
              <SelectItem value="MONTHLY">{t("monthly")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {frequency === "WEEKLY" && (
          <div className="space-y-1.5">
            <Label>{t("dayOfWeek")}</Label>
            <Select value={weekday} onValueChange={setWeekday}>
              <SelectTrigger className="cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WEEKDAYS.map((d) => (
                  <SelectItem key={d} value={String(d)}>
                    {t(`weekday.${d}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {frequency === "MONTHLY" && (
          <div className="space-y-1.5">
            <Label>{t("dayOfMonth")}</Label>
            <Input
              type="number"
              min={1}
              max={31}
              value={dayOfMonth}
              onChange={(e) => setDayOfMonth(e.target.value)}
            />
          </div>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1.5">
          <Label>{t("hour")}</Label>
          <Input
            type="number"
            min={0}
            max={23}
            value={hour}
            onChange={(e) => setHour(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>{t("minute")}</Label>
          <Input
            type="number"
            min={0}
            max={59}
            value={minute}
            onChange={(e) => setMinute(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>{t("timezone")}</Label>
          <Input
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            dir="ltr"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>{t("actions")}</Label>
        <ButlerActionBuilder
          scope="board"
          actions={actions}
          onChange={setActions}
          columns={columns}
          labels={labels}
          members={members}
        />
      </div>
      <Button
        className="w-full cursor-pointer"
        disabled={pending}
        onClick={() =>
          onSubmit(
            {
              kind: "CALENDAR",
              name,
              actions,
              trigger: { type: "SCHEDULE" },
              schedule: {
                frequency,
                hour: clamp(hour, 0, 23),
                minute: clamp(minute, 0, 59),
                timezone: timezone.trim() || "UTC",
                ...(frequency === "WEEKLY"
                  ? { weekday: clamp(weekday, 0, 6) }
                  : {}),
                ...(frequency === "MONTHLY"
                  ? { dayOfMonth: clamp(dayOfMonth, 1, 31) }
                  : {}),
              },
            },
            () => {
              setName("");
              setActions([newActionDraft()]);
            },
          )
        }
      >
        <Plus className="me-2 size-4" />
        {t("addCalendar")}
      </Button>
    </FormShell>
  );
}
