"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Rocket } from "lucide-react";
import { toast } from "sonner";
import { useActiveWorkspace } from "@/components/layout/active-workspace-context";
import {
  useActivateSprint,
  useCloseSprint,
  useCreateSprint,
  useSprints,
} from "@/hooks/use-sprints";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function SprintsPageView({ embedded = false }: { embedded?: boolean }) {
  const t = useTranslations("sprints");
  const { workspaceId } = useActiveWorkspace();
  const { data: sprints = [], isLoading, isError } = useSprints(workspaceId);
  const createSprint = useCreateSprint(workspaceId ?? "");
  const activate = useActivateSprint(workspaceId ?? "");
  const close = useCloseSprint(workspaceId ?? "");

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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
            if (!workspaceId || !name.trim() || !startDate || !endDate)
              return;
            createSprint.mutate(
              {
                name: name.trim(),
                startDate: new Date(startDate).toISOString(),
                endDate: new Date(endDate).toISOString(),
              },
              {
                onSuccess: () => {
                  toast.success(t("created"));
                  setOpen(false);
                  setName("");
                  setStartDate("");
                  setEndDate("");
                },
                onError: () => toast.error(t("createFailed")),
              },
            );
          }}
        >
          <div className="space-y-2">
            <Label>{t("name")}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("start")}</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("end")}</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full cursor-pointer"
            disabled={createSprint.isPending}
          >
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
        <EmptyState
          icon={Rocket}
          title={t("noWorkspace")}
          description={t("noWorkspaceBody")}
        />
      )}

      {isLoading && <Skeleton className="h-32 w-full rounded-md" />}

      {isError && (
        <EmptyState
          icon={Rocket}
          title={t("errorTitle")}
          description={t("errorBody")}
        />
      )}

      {!isLoading && !isError && sprints.length === 0 && workspaceId && (
        <EmptyState
          icon={Rocket}
          title={t("emptyTitle")}
          description={t("emptyBody")}
        />
      )}

      {sprints.length > 0 && (
        <ul className="space-y-3">
          {sprints.map((s) => (
            <li
              key={s.id}
              className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-card px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium">{s.name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(s.startDate).toLocaleDateString()} —{" "}
                  {new Date(s.endDate).toLocaleDateString()}
                  {s.cardCount != null ? ` · ${t("cards", { count: s.cardCount })}` : ""}
                </p>
              </div>
              <Badge
                variant={
                  s.status === "ACTIVE"
                    ? "default"
                    : s.status === "CLOSED"
                      ? "outline"
                      : "secondary"
                }
              >
                {t(`status.${s.status}`)}
              </Badge>
              {s.status !== "ACTIVE" && s.status !== "CLOSED" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() =>
                    activate.mutate(s.id, {
                      onSuccess: () => toast.success(t("activated")),
                      onError: () => toast.error(t("actionFailed")),
                    })
                  }
                >
                  {t("activate")}
                </Button>
              )}
              {s.status === "ACTIVE" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() =>
                    close.mutate(s.id, {
                      onSuccess: () => toast.success(t("closed")),
                      onError: () => toast.error(t("actionFailed")),
                    })
                  }
                >
                  {t("close")}
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
