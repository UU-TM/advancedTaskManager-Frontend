"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Target } from "lucide-react";
import { toast } from "sonner";
import { useActiveWorkspace } from "@/components/layout/active-workspace-context";
import {
  useAddKeyResult,
  useCreateGoal,
  useGoals,
  useUpdateKeyResult,
} from "@/hooks/use-goals";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function GoalsPageView() {
  const t = useTranslations("goals");
  const { workspaceId } = useActiveWorkspace();
  const { data: goals = [], isLoading, isError } = useGoals(workspaceId);
  const createGoal = useCreateGoal(workspaceId ?? "");
  const addKr = useAddKeyResult(workspaceId ?? "");
  const updateKr = useUpdateKeyResult(workspaceId ?? "");

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [krDrafts, setKrDrafts] = useState<Record<string, string>>({});

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-6 md:px-6">
      <PageHeader
        title={t("title")}
        description={t("subtitle")}
        actions={
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
                  createGoal.mutate(
                    {
                      name: name.trim(),
                      description: description.trim() || null,
                    },
                    {
                      onSuccess: () => {
                        toast.success(t("created"));
                        setOpen(false);
                        setName("");
                        setDescription("");
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
                <div className="space-y-2">
                  <Label>{t("description")}</Label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full cursor-pointer"
                  disabled={createGoal.isPending}
                >
                  {t("create")}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {!workspaceId && (
        <EmptyState
          icon={Target}
          title={t("noWorkspace")}
          description={t("noWorkspaceBody")}
        />
      )}

      {isLoading && <Skeleton className="h-40 w-full rounded-xl" />}

      {isError && (
        <EmptyState
          icon={Target}
          title={t("errorTitle")}
          description={t("errorBody")}
        />
      )}

      {!isLoading && goals.length === 0 && workspaceId && (
        <EmptyState
          icon={Target}
          title={t("emptyTitle")}
          description={t("emptyBody")}
        />
      )}

      <div className="space-y-4">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className="space-y-3 rounded-xl border border-border bg-card p-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-semibold">{goal.name}</h2>
              <Badge variant="secondary">{t(`status.${goal.status}`)}</Badge>
            </div>
            {goal.description && (
              <p className="text-sm text-muted-foreground">{goal.description}</p>
            )}
            <ul className="space-y-3">
              {(goal.keyResults ?? []).map((kr) => {
                const pct =
                  kr.targetNumber > 0
                    ? Math.min(
                        100,
                        Math.round((kr.currentNumber / kr.targetNumber) * 100),
                      )
                    : 0;
                return (
                  <li key={kr.id} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span>{kr.title}</span>
                      <span className="text-muted-foreground">
                        {kr.currentNumber}/{kr.targetNumber}
                      </span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        className="h-8 w-28"
                        defaultValue={kr.currentNumber}
                        onBlur={(e) => {
                          const next = Number(e.target.value);
                          if (!Number.isFinite(next) || next === kr.currentNumber)
                            return;
                          updateKr.mutate(
                            { id: kr.id, input: { currentNumber: next } },
                            {
                              onSuccess: () => toast.success(t("krUpdated")),
                              onError: () => toast.error(t("actionFailed")),
                            },
                          );
                        }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const title = (krDrafts[goal.id] ?? "").trim();
                if (!title) return;
                addKr.mutate(
                  {
                    goalId: goal.id,
                    input: { title, targetNumber: 100, currentNumber: 0 },
                  },
                  {
                    onSuccess: () => {
                      toast.success(t("krAdded"));
                      setKrDrafts((d) => ({ ...d, [goal.id]: "" }));
                    },
                    onError: () => toast.error(t("actionFailed")),
                  },
                );
              }}
            >
              <Input
                placeholder={t("addKr")}
                className="h-9"
                value={krDrafts[goal.id] ?? ""}
                onChange={(e) =>
                  setKrDrafts((d) => ({ ...d, [goal.id]: e.target.value }))
                }
              />
              <Button type="submit" size="sm" className="cursor-pointer">
                {t("add")}
              </Button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
