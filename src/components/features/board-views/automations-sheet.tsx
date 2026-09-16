"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus, Trash2, Zap } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
        <Button variant="outline" size="sm" className="cursor-pointer">
          <Zap className="me-2 size-4" />
          {t("title")}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{t("title")}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="space-y-3 rounded-xl border border-border p-4">
            <p className="text-sm font-medium">{t("newRule")}</p>
            <div className="space-y-2">
              <Label>{t("name")}</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("namePlaceholder")}
              />
            </div>
            <div className="space-y-2">
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
            <div className="space-y-2">
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

          <ul className="space-y-3">
            {rules.map((rule) => (
              <li
                key={rule.id}
                className="flex items-start gap-3 rounded-xl border border-border p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{rule.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {rule.trigger.type} →{" "}
                    {rule.actions.map((a) => a.type).join(", ")}
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
                  onClick={() =>
                    remove.mutate(rule.id, {
                      onSuccess: () => toast.success(t("deleted")),
                    })
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
            {rules.length === 0 && (
              <p className="text-sm text-muted-foreground">{t("empty")}</p>
            )}
          </ul>
        </div>
      </SheetContent>
    </Sheet>
  );
}
