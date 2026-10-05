"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus, Trash2, Zap } from "lucide-react";
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
  useUpdateAutomation,
} from "@/hooks/use-automations";
import type { BoardColumn } from "@/types/domain";

type AutomationsSheetProps = {
  boardId: string;
  columns: BoardColumn[];
};

export function AutomationsSheet({ boardId, columns }: AutomationsSheetProps) {
  const t = useTranslations("automations");
  const { data: rules = [] } = useAutomations(boardId);
  const create = useCreateAutomation(boardId);
  const update = useUpdateAutomation(boardId);
  const remove = useDeleteAutomation(boardId);

  const [name, setName] = useState("");
  const [triggerType, setTriggerType] = useState("CARD_MOVED");
  const [triggerColumnId, setTriggerColumnId] = useState("");
  const [actionType, setActionType] = useState("NOTIFY");
  const [actionColumnId, setActionColumnId] = useState("");
  const [message, setMessage] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const triggerLabels: Record<string, string> = {
    CARD_MOVED: t("trigMoved"),
    CARD_ASSIGNED: t("trigAssigned"),
    CHECKLIST_COMPLETE: t("trigChecklist"),
    DUE_SOON: t("trigDueSoon"),
    GITHUB_PR_MERGED: t("trigPrMerged"),
  };
  const actionLabels: Record<string, string> = {
    NOTIFY: t("actNotify"),
    MOVE_TO_COLUMN: t("actMove"),
    SET_DUE_DAYS: t("actDue"),
    CREATE_REMINDER: t("actReminder"),
    ADD_LABEL: t("actNotify"),
    ASSIGN_USER: t("actNotify"),
  };

  function columnTitle(id?: string) {
    if (!id) return null;
    return columns.find((column) => column.id === id)?.title ?? null;
  }

  function handleCreate() {
    if (!name.trim()) {
      toast.error(t("nameRequired"));
      return;
    }
    create.mutate(
      {
        name: name.trim(),
        enabled: true,
        trigger: {
          type: triggerType as
            | "CARD_MOVED"
            | "CARD_ASSIGNED"
            | "DUE_SOON"
            | "CHECKLIST_COMPLETE"
            | "GITHUB_PR_MERGED",
          ...(triggerType === "CARD_MOVED" && triggerColumnId
            ? { columnId: triggerColumnId }
            : {}),
          ...(triggerType === "DUE_SOON" ? { hoursBeforeDue: 24 } : {}),
        },
        conditions: null,
        actions: [
          {
            type: actionType as
              | "MOVE_TO_COLUMN"
              | "ADD_LABEL"
              | "ASSIGN_USER"
              | "SET_DUE_DAYS"
              | "NOTIFY"
              | "CREATE_REMINDER",
            ...(actionType === "MOVE_TO_COLUMN" && actionColumnId
              ? { columnId: actionColumnId }
              : {}),
            ...(actionType === "SET_DUE_DAYS" ? { days: 3 } : {}),
            message: message || undefined,
          },
        ],
      },
      {
        onSuccess: () => {
          toast.success(t("created"));
          setName("");
          setMessage("");
        },
        onError: () => toast.error(t("createFailed")),
      },
    );
  }

  return (
    <Sheet>
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
      <SheetContent className="w-full gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border">
          <SheetTitle>{t("title")}</SheetTitle>
          <SheetDescription>{t("subtitle")}</SheetDescription>
        </SheetHeader>

        <div className="space-y-3 border-b border-border p-4">
          <p className="text-sm font-medium">{t("newRule")}</p>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>{t("name")}</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("namePlaceholder")}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("when")}</Label>
              <Select value={triggerType} onValueChange={setTriggerType}>
                <SelectTrigger className="cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CARD_MOVED">{t("trigMoved")}</SelectItem>
                  <SelectItem value="CARD_ASSIGNED">
                    {t("trigAssigned")}
                  </SelectItem>
                  <SelectItem value="CHECKLIST_COMPLETE">
                    {t("trigChecklist")}
                  </SelectItem>
                  <SelectItem value="DUE_SOON">{t("trigDueSoon")}</SelectItem>
                  <SelectItem value="GITHUB_PR_MERGED">
                    {t("trigPrMerged")}
                  </SelectItem>
                </SelectContent>
              </Select>
              {triggerType === "CARD_MOVED" && (
                <Select
                  value={triggerColumnId || "any"}
                  onValueChange={(v) =>
                    setTriggerColumnId(v === "any" ? "" : v)
                  }
                >
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue placeholder={t("anyColumn")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">{t("anyColumn")}</SelectItem>
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
              <Label>{t("then")}</Label>
              <Select value={actionType} onValueChange={setActionType}>
                <SelectTrigger className="cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NOTIFY">{t("actNotify")}</SelectItem>
                  <SelectItem value="MOVE_TO_COLUMN">{t("actMove")}</SelectItem>
                  <SelectItem value="SET_DUE_DAYS">{t("actDue")}</SelectItem>
                  <SelectItem value="CREATE_REMINDER">
                    {t("actReminder")}
                  </SelectItem>
                </SelectContent>
              </Select>
              {actionType === "MOVE_TO_COLUMN" && (
                <Select
                  value={actionColumnId}
                  onValueChange={setActionColumnId}
                >
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue placeholder={t("pickColumn")} />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("messagePlaceholder")}
              />
            </div>
            <Button
              className="w-full cursor-pointer"
              onClick={handleCreate}
              disabled={create.isPending}
            >
              <Plus className="me-2 size-4" />
              {t("add")}
            </Button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {rules.length === 0 ? (
            <EmptyState
              icon={Zap}
              title={t("emptyTitle")}
              description={t("empty")}
              className="h-full"
            />
          ) : (
          <ul className="space-y-2">
            {rules.map((rule) => {
              const when = triggerLabels[rule.trigger.type] ?? rule.trigger.type;
              const whenColumn = columnTitle(rule.trigger.columnId);
              const then = rule.actions
                .map((action) => {
                  const label = actionLabels[action.type] ?? action.type;
                  const target = columnTitle(action.columnId);
                  return target ? `${label}: ${target}` : label;
                })
                .join(", ");
              return (
              <li
                key={rule.id}
                className="flex items-start gap-3 rounded-lg border border-border p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{rule.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {when}
                    {whenColumn ? ` · ${whenColumn}` : ""} → {then}
                  </p>
                </div>
                <Switch
                  checked={rule.enabled}
                  onCheckedChange={(enabled) =>
                    update.mutate({ id: rule.id, enabled })
                  }
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="cursor-pointer text-destructive"
                  aria-label={t("deleted")}
                  onClick={() => setDeleteId(rule.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
              );
            })}
          </ul>
          )}
        </div>
      </SheetContent>
      <ConfirmDelete
        open={deleteId != null}
        onOpenChange={(next) => {
          if (!next) setDeleteId(null);
        }}
        onConfirm={() => {
          if (!deleteId) return;
          remove.mutate(deleteId, {
            onSuccess: () => toast.success(t("deleted")),
          });
          setDeleteId(null);
        }}
      />
    </Sheet>
  );
}
