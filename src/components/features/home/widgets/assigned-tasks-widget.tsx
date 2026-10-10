"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { ListChecks, Loader2, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { homeKeys, useHome } from "@/hooks/use-home";
import { useActiveWorkspace } from "@/components/layout/active-workspace-context";
import { useBoards } from "@/hooks/use-boards";
import { useAssignCard, useCreateCard } from "@/hooks/use-card";
import { ApiError, boardsApi } from "@/lib/api";
import type { HomeAssignedCard } from "@/types/domain";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WidgetShell } from "./widget-shell";
import { cn } from "@/lib/utils";

const TILE_COLORS = [
  "bg-primary",
  "bg-accent",
  "bg-info",
  "bg-success",
  "bg-muted-foreground",
] as const;

type Tab = "upcoming" | "overdue" | "completed";

function progressOf(card: HomeAssignedCard): number {
  if (card.totalChecklistItems <= 0) {
    return card.archivedAt ? 100 : 0;
  }
  return Math.round(
    (card.completedChecklistItems / card.totalChecklistItems) * 100,
  );
}

function CreateAssignedTaskDialog() {
  const t = useTranslations("dashboard.assigned");
  const { user } = useAuth();
  const { workspaceId } = useActiveWorkspace();
  const { data: boards = [] } = useBoards(workspaceId);
  const [open, setOpen] = useState(false);
  const [boardId, setBoardId] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const createCard = useCreateCard();
  const assignCard = useAssignCard();
  const qc = useQueryClient();

  const boardQuery = useQuery({
    queryKey: ["board-with-columns", boardId] as const,
    queryFn: () => boardsApi.get(boardId, { columns: true }),
    enabled: !!boardId && open,
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const columnId = boardQuery.data?.columns?.[0]?.id;
    if (!boardId || !columnId || !title.trim()) {
      setError(t("createFailed"));
      return;
    }
    try {
      const card = await createCard.mutateAsync({
        boardId,
        columnId,
        title: title.trim(),
      });
      if (user?.id) {
        await assignCard.mutateAsync({ id: card.id, userId: user.id });
      }
      await qc.invalidateQueries({ queryKey: homeKeys.all });
      setTitle("");
      setBoardId("");
      setOpen(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("createFailed"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          className="size-7 cursor-pointer rounded-full"
          aria-label={t("add")}
        >
          <Plus className="size-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={(e) => void onSubmit(e)}>
          <DialogHeader>
            <DialogTitle>{t("createTitle")}</DialogTitle>
            <DialogDescription>{t("createDescription")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {boards.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("noBoards")}</p>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label>{t("board")}</Label>
                  <Select value={boardId || undefined} onValueChange={setBoardId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("boardPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {boards.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="assigned-title">{t("cardTitle")}</Label>
                  <Input
                    id="assigned-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={
                boards.length === 0 ||
                createCard.isPending ||
                assignCard.isPending
              }
              className="cursor-pointer"
            >
              {createCard.isPending || assignCard.isPending ? (
                <>
                  <Loader2 className="me-2 size-4 animate-spin" />
                  {t("creating")}
                </>
              ) : (
                t("create")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AssignedTasksWidget() {
  const t = useTranslations("dashboard.assigned");
  const { data, isLoading } = useHome();
  const [tab, setTab] = useState<Tab>("upcoming");
  const now = Date.now();

  const rows = useMemo(() => {
    const cards = data?.assignedCards ?? [];
    if (tab === "completed") {
      return cards.filter((c) => c.archivedAt != null);
    }
    if (tab === "overdue") {
      return cards.filter(
        (c) =>
          !c.archivedAt &&
          c.dueDate != null &&
          new Date(c.dueDate).getTime() < now,
      );
    }
    return cards.filter(
      (c) =>
        !c.archivedAt &&
        (c.dueDate == null || new Date(c.dueDate).getTime() >= now),
    );
  }, [data?.assignedCards, tab, now]);

  const tabs: { id: Tab; label: string }[] = [
    { id: "upcoming", label: t("upcoming") },
    { id: "overdue", label: t("overdue") },
    { id: "completed", label: t("completed") },
  ];

  return (
    <WidgetShell>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold">{t("title")}</h2>
        <CreateAssignedTaskDialog />
      </div>

      <div className="mb-4 flex gap-4 border-b border-border/60">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            className={cn(
              "cursor-pointer pb-2 text-sm",
              tab === item.id
                ? "border-b-2 border-dashboard-accent font-medium text-dashboard-accent"
                : "text-muted-foreground",
            )}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <ul className="space-y-3">
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="flex items-center gap-3 py-1">
              <Skeleton className="size-8 shrink-0 rounded-lg" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-1.5 w-28" />
              <Skeleton className="size-6 rounded-full" />
            </li>
          ))}
        {!isLoading &&
          rows.slice(0, 5).map((card, index) => {
            const pct = progressOf(card);
            const tile = TILE_COLORS[index % TILE_COLORS.length]!;
            const letter = card.title.trim().charAt(0).toUpperCase() || "#";
            return (
            <li key={card.id}>
              <Link
                href={`/boards/${card.boardId}?card=${card.id}`}
                className="flex items-center gap-3 rounded-lg py-1 transition-opacity hover:opacity-80"
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-primary-foreground",
                    tile,
                  )}
                >
                  {letter}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                  {card.title}
                </span>
                <div className="hidden w-28 shrink-0 items-center gap-2 sm:flex">
                  <Progress
                    value={pct}
                    className="h-1.5 flex-1 bg-muted [&>[data-slot=progress-indicator]]:bg-dashboard-accent"
                  />
                  <span className="w-8 text-end text-xs text-muted-foreground">
                    {pct}%
                  </span>
                </div>
                <div className="flex shrink-0 -space-x-2">
                  {card.assignees.slice(0, 3).map((a) => (
                    <Avatar key={a.id} className="size-6 border-2 border-card">
                      <AvatarFallback className="text-[9px]">
                        {a.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </Link>
            </li>
            );
          })}
      </ul>
      {!isLoading && rows.length === 0 && (
        <EmptyState
          icon={ListChecks}
          title={t("emptyTitle")}
          description={t("emptyDescription")}
          className="border-0 bg-transparent px-0 py-6"
        />
      )}
    </WidgetShell>
  );
}
