"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Flag, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useActiveWorkspace } from "@/components/layout/active-workspace-context";
import {
  useCreateMilestone,
  useDeleteMilestone,
  useMilestones,
} from "@/hooks/use-milestones";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatAppDate } from "@/lib/date";
import { useLocale } from "next-intl";
import type { Locale } from "@/i18n/config";

export function MilestonesPageView({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const t = useTranslations("milestones");
  const locale = useLocale() as Locale;
  const { workspaceId } = useActiveWorkspace();
  const { data: milestones = [], isLoading, isError } = useMilestones(workspaceId);
  const createMilestone = useCreateMilestone(workspaceId ?? "");
  const deleteMilestone = useDeleteMilestone(workspaceId ?? "");

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [dueDate, setDueDate] = useState("");

  const createDialog = (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer" disabled={!workspaceId}>
          <Plus className="me-1.5 size-4" />
          {t("create")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createTitle")}</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!workspaceId || !name.trim()) return;
            createMilestone.mutate(
              {
                name: name.trim(),
                dueDate: dueDate ? new Date(dueDate).toISOString() : null,
              },
              {
                onSuccess: () => {
                  toast.success(t("created"));
                  setOpen(false);
                  setName("");
                  setDueDate("");
                },
                onError: () => toast.error(t("createFailed")),
              },
            );
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="ms-name">{t("name")}</Label>
            <Input
              id="ms-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ms-due">{t("dueDate")}</Label>
            <Input
              id="ms-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={createMilestone.isPending}>
            {t("create")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );

  return (
    <div
      className={
        embedded
          ? "space-y-6"
          : "mx-auto max-w-4xl space-y-8 px-4 py-6 md:px-6"
      }
    >
      {embedded ? (
        <div className="flex justify-end">{createDialog}</div>
      ) : (
        <PageHeader
          title={t("title")}
          description={t("subtitle")}
          actions={createDialog}
        />
      )}

      {!workspaceId && (
        <EmptyState title={t("noWorkspace")} description={t("noWorkspaceBody")} />
      )}

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      )}

      {isError && (
        <EmptyState title={t("errorTitle")} description={t("errorBody")} />
      )}

      {!isLoading && !isError && workspaceId && milestones.length === 0 && (
        <EmptyState
          icon={Flag}
          title={t("emptyTitle")}
          description={t("emptyBody")}
        />
      )}

      <ul className="divide-y divide-border overflow-hidden rounded-md border border-border bg-card">
        {milestones.map((m) => (
          <li
            key={m.id}
            className="flex flex-wrap items-center gap-3 px-4 py-3"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium">{m.name}</p>
              <p className="text-xs text-muted-foreground">
                {m.dueDate
                  ? formatAppDate(m.dueDate, "d MMM yyyy", locale)
                  : t("noDue")}
                {m.cardIds?.length
                  ? ` · ${t("cardCount", { count: m.cardIds.length })}`
                  : ""}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              className="cursor-pointer text-destructive"
              aria-label={t("delete")}
              onClick={() =>
                deleteMilestone.mutate(m.id, {
                  onSuccess: () => toast.success(t("deleted")),
                  onError: () => toast.error(t("deleteFailed")),
                })
              }
            >
              <Trash2 className="size-4" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
