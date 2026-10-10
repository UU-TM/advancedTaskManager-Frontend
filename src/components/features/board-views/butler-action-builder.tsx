"use client";

import { useTranslations } from "next-intl";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  AutomationAction,
  AutomationActionType,
  BoardColumn,
  CardPriority,
  Label as BoardLabel,
} from "@/types/domain";

export type ActionDraft = {
  key: string;
  type: AutomationActionType;
  columnId: string;
  targetColumnId: string;
  labelId: string;
  userId: string;
  days: string;
  priority: CardPriority;
  title: string;
  message: string;
};

export type ActionScope = "rule" | "card" | "board";

const CARD_ACTIONS: AutomationActionType[] = [
  "MOVE_TO_COLUMN",
  "ADD_LABEL",
  "REMOVE_LABEL",
  "ASSIGN_USER",
  "UNASSIGN_USER",
  "SET_DUE_DAYS",
  "CLEAR_DUE",
  "SET_PRIORITY",
  "MARK_COMPLETE",
  "ARCHIVE_CARD",
  "NOTIFY",
  "CREATE_REMINDER",
];

const BOARD_ACTIONS: AutomationActionType[] = [
  "CREATE_CARD",
  "MOVE_ALL_CARDS",
  "ARCHIVE_ALL_IN_COLUMN",
  "NOTIFY",
];

export function actionsForScope(scope: ActionScope): AutomationActionType[] {
  if (scope === "card") return CARD_ACTIONS;
  if (scope === "board") return BOARD_ACTIONS;
  return [...CARD_ACTIONS, "CREATE_CARD"];
}

let draftSeq = 0;
export function newActionDraft(
  type: AutomationActionType = "NOTIFY",
): ActionDraft {
  draftSeq += 1;
  return {
    key: `a${Date.now()}-${draftSeq}`,
    type,
    columnId: "",
    targetColumnId: "",
    labelId: "",
    userId: "",
    days: "3",
    priority: "HIGH",
    title: "",
    message: "",
  };
}

export function isActionValid(a: ActionDraft): boolean {
  switch (a.type) {
    case "MOVE_TO_COLUMN":
    case "ARCHIVE_ALL_IN_COLUMN":
      return !!a.columnId;
    case "MOVE_ALL_CARDS":
      return !!a.columnId && !!a.targetColumnId && a.columnId !== a.targetColumnId;
    case "CREATE_CARD":
      return !!a.columnId && !!a.title.trim();
    case "ADD_LABEL":
    case "REMOVE_LABEL":
      return !!a.labelId;
    case "ASSIGN_USER":
    case "UNASSIGN_USER":
      return !!a.userId;
    case "SET_DUE_DAYS": {
      const n = Number(a.days);
      return Number.isFinite(n) && n >= 0;
    }
    default:
      return true;
  }
}

export function draftToAction(a: ActionDraft): AutomationAction {
  const base: AutomationAction = { type: a.type };
  switch (a.type) {
    case "MOVE_TO_COLUMN":
    case "ARCHIVE_ALL_IN_COLUMN":
      return { ...base, columnId: a.columnId };
    case "MOVE_ALL_CARDS":
      return { ...base, columnId: a.columnId, targetColumnId: a.targetColumnId };
    case "CREATE_CARD":
      return { ...base, columnId: a.columnId, title: a.title.trim() };
    case "ADD_LABEL":
    case "REMOVE_LABEL":
      return { ...base, labelId: a.labelId };
    case "ASSIGN_USER":
    case "UNASSIGN_USER":
      return { ...base, userId: a.userId };
    case "SET_DUE_DAYS":
      return { ...base, days: Math.max(0, Math.round(Number(a.days) || 0)) };
    case "SET_PRIORITY":
      return { ...base, priority: a.priority };
    case "NOTIFY":
    case "CREATE_REMINDER":
      return { ...base, ...(a.message.trim() ? { message: a.message.trim() } : {}) };
    default:
      return base;
  }
}

const PRIORITIES: CardPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

type Member = { id: string; username: string };

type ActionBuilderProps = {
  scope: ActionScope;
  actions: ActionDraft[];
  onChange: (next: ActionDraft[]) => void;
  columns: BoardColumn[];
  labels: BoardLabel[];
  members: Member[];
};

function ColumnSelect({
  value,
  onChange,
  columns,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  columns: BoardColumn[];
  placeholder: string;
}) {
  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger className="h-8 w-full cursor-pointer">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {columns.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            {c.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Multi-action builder used by rules, buttons and calendar commands. */
export function ButlerActionBuilder({
  scope,
  actions,
  onChange,
  columns,
  labels,
  members,
}: ActionBuilderProps) {
  const t = useTranslations("butler");
  const allowed = actionsForScope(scope);

  function patch(key: string, partial: Partial<ActionDraft>) {
    onChange(actions.map((a) => (a.key === key ? { ...a, ...partial } : a)));
  }

  return (
    <div className="space-y-2">
      {actions.map((a, index) => (
        <div
          key={a.key}
          className="space-y-2 rounded-md border border-border bg-muted/30 p-2"
        >
          <div className="flex items-center gap-2">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-semibold text-primary">
              {index + 1}
            </span>
            <Select
              value={a.type}
              onValueChange={(v) =>
                patch(a.key, { ...newActionDraft(v as AutomationActionType), key: a.key })
              }
            >
              <SelectTrigger className="h-8 flex-1 cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allowed.map((type) => (
                  <SelectItem key={type} value={type}>
                    {t(`action.${type}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              className="cursor-pointer text-muted-foreground"
              aria-label={t("removeAction")}
              disabled={actions.length <= 1}
              onClick={() => onChange(actions.filter((x) => x.key !== a.key))}
            >
              <X className="size-4" />
            </Button>
          </div>

          {(a.type === "MOVE_TO_COLUMN" ||
            a.type === "ARCHIVE_ALL_IN_COLUMN" ||
            a.type === "CREATE_CARD") && (
            <ColumnSelect
              value={a.columnId}
              onChange={(v) => patch(a.key, { columnId: v })}
              columns={columns}
              placeholder={t("pickList")}
            />
          )}

          {a.type === "MOVE_ALL_CARDS" && (
            <div className="grid grid-cols-2 gap-2">
              <ColumnSelect
                value={a.columnId}
                onChange={(v) => patch(a.key, { columnId: v })}
                columns={columns}
                placeholder={t("fromList")}
              />
              <ColumnSelect
                value={a.targetColumnId}
                onChange={(v) => patch(a.key, { targetColumnId: v })}
                columns={columns}
                placeholder={t("toList")}
              />
            </div>
          )}

          {a.type === "CREATE_CARD" && (
            <Input
              value={a.title}
              onChange={(e) => patch(a.key, { title: e.target.value })}
              placeholder={t("cardTitlePlaceholder")}
              className="h-8"
            />
          )}

          {(a.type === "ADD_LABEL" || a.type === "REMOVE_LABEL") && (
            <Select
              value={a.labelId || undefined}
              onValueChange={(v) => patch(a.key, { labelId: v })}
            >
              <SelectTrigger className="h-8 w-full cursor-pointer">
                <SelectValue placeholder={t("pickLabel")} />
              </SelectTrigger>
              <SelectContent>
                {labels.length === 0 && (
                  <div className="px-2 py-1.5 text-xs text-muted-foreground">
                    {t("noLabels")}
                  </div>
                )}
                {labels.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    <span className="flex items-center gap-2">
                      <span
                        className="size-3 rounded-sm"
                        style={{ backgroundColor: l.color }}
                      />
                      {l.name || t("unnamedLabel")}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {(a.type === "ASSIGN_USER" || a.type === "UNASSIGN_USER") && (
            <Select
              value={a.userId || undefined}
              onValueChange={(v) => patch(a.key, { userId: v })}
            >
              <SelectTrigger className="h-8 w-full cursor-pointer">
                <SelectValue placeholder={t("pickMember")} />
              </SelectTrigger>
              <SelectContent>
                {members.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {a.type === "SET_DUE_DAYS" && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Input
                type="number"
                min={0}
                value={a.days}
                onChange={(e) => patch(a.key, { days: e.target.value })}
                className="h-8 w-20"
              />
              {t("daysFromNow")}
            </div>
          )}

          {a.type === "SET_PRIORITY" && (
            <Select
              value={a.priority}
              onValueChange={(v) => patch(a.key, { priority: v as CardPriority })}
            >
              <SelectTrigger className="h-8 w-full cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {t(`priority.${p}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {(a.type === "NOTIFY" || a.type === "CREATE_REMINDER") && (
            <Input
              value={a.message}
              onChange={(e) => patch(a.key, { message: e.target.value })}
              placeholder={t("messagePlaceholder")}
              className="h-8"
            />
          )}
        </div>
      ))}
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="w-full cursor-pointer border-dashed"
        onClick={() => onChange([...actions, newActionDraft("NOTIFY")])}
      >
        <Plus className="me-1.5 size-3.5" />
        {t("addAction")}
      </Button>
    </div>
  );
}
