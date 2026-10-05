"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  CalendarDays,
  Columns3,
  GanttChart,
  ListChecks,
  Table2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppBreadcrumbs } from "@/components/layout/app-breadcrumbs";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BoardKanban } from "@/components/features/kanban/BoardKanban";
import { BoardMembersDialog } from "@/components/features/kanban/BoardMembersDialog";
import { BoardManageMenu } from "@/components/features/kanban/BoardManageMenu";
import { BoardGithubSheet } from "@/components/features/kanban/BoardGithubSheet";
import { CardDetailModal } from "@/components/features/kanban/CardDetailModal";
import { BoardTableView } from "./board-table-view";
import { BoardCalendarView } from "./board-calendar-view";
import { BoardTimelineView } from "./board-timeline-view";
import { AutomationsSheet } from "./automations-sheet";
import { BoardShareDialog } from "./board-share-dialog";
import { BoardPresenceStrip } from "./board-presence-strip";
import {
  BoardFiltersBar,
  filterColumns,
  type BoardFilters,
} from "./board-filters";
import { useBoard } from "@/hooks/use-boards";
import { useColumns } from "@/hooks/use-columns";
import { useBoardLabels, useBoardMembers } from "@/hooks/use-kanban-extras";
import {
  useBoardViewPrefs,
  useUpdateBoardViewPrefs,
} from "@/hooks/use-board-view-prefs";
import { useBoardDependencies } from "@/hooks/use-dependencies";
import { useBoardEvents } from "@/hooks/use-board-events";
import type { BoardViewMode } from "@/types/domain";
import { BoardBriefDialog } from "./board-brief";
import { cn } from "@/lib/utils";

const VIEW_ORDER: BoardViewMode[] = [
  "KANBAN",
  "TABLE",
  "CALENDAR",
  "TIMELINE",
];

type BoardShellProps = {
  boardId: string;
};

export function BoardShell({ boardId }: BoardShellProps) {
  const t = useTranslations("kanban");
  const tViews = useTranslations("boardViews");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: board } = useBoard(boardId);
  const { data: columns = [], isLoading } = useColumns(boardId);
  const { data: labels = [] } = useBoardLabels(boardId);
  const { data: members = [] } = useBoardMembers(boardId);
  const { data: prefs } = useBoardViewPrefs(boardId);
  const updatePrefs = useUpdateBoardViewPrefs(boardId);
  const { data: dependencies = [] } = useBoardDependencies(boardId);
  useBoardEvents(boardId);
  const tBrief = useTranslations("brief");

  const [viewMode, setViewMode] = useState<BoardViewMode>("KANBAN");
  const [filters, setFilters] = useState<BoardFilters>({});
  const [openCardId, setOpenCardId] = useState<string | null>(null);
  const [membersOpen, setMembersOpen] = useState(false);
  const [briefOpen, setBriefOpen] = useState(false);

  useEffect(() => {
    const fromUrl = searchParams.get("view") as BoardViewMode | null;
    if (fromUrl && VIEW_ORDER.includes(fromUrl)) setViewMode(fromUrl);
    else if (prefs?.viewMode) setViewMode(prefs.viewMode);
    if (prefs?.filters) setFilters(prefs.filters as BoardFilters);
  }, [prefs, searchParams]);

  useEffect(() => {
    const card = searchParams.get("card");
    if (card) setOpenCardId(card);
  }, [searchParams]);

  const setOpenCard = useCallback(
    (id: string | null) => {
      setOpenCardId(id);
      const params = new URLSearchParams(searchParams.toString());
      if (id) params.set("card", id);
      else params.delete("card");
      const qs = params.toString();
      router.replace(
        qs ? `/boards/${boardId}?${qs}` : `/boards/${boardId}`,
        { scroll: false },
      );
    },
    [boardId, router, searchParams],
  );

  const filteredColumns = useMemo(
    () => filterColumns(columns, filters),
    [columns, filters],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if ((e.target as HTMLElement).isContentEditable) return;
      if (document.querySelector("[role='dialog']")) return;
      if (e.key >= "1" && e.key <= "4") {
        const next = VIEW_ORDER[Number(e.key) - 1];
        setViewMode(next);
        updatePrefs.mutate({ viewMode: next });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [updatePrefs]);

  return (
    <div className="flex h-[calc(100dvh-3rem)] flex-col">
      <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border/80 bg-background/90 px-4 py-2.5 backdrop-blur-sm md:px-6">
        <Button asChild variant="ghost" size="sm" className="cursor-pointer">
          <Link href="/boards">
            <ArrowLeft className="me-2 size-4 rtl:rotate-180" />
            {t("boards")}
          </Link>
        </Button>
        <AppBreadcrumbs boardName={board?.name} />
        <h1 className="truncate text-base font-semibold tracking-tight sm:hidden">
          {board?.name ?? t("loadingBoard")}
        </h1>

        <Tabs
          value={viewMode}
          onValueChange={(v) => {
            const mode = v as BoardViewMode;
            setViewMode(mode);
            updatePrefs.mutate({ viewMode: mode });
            const params = new URLSearchParams(searchParams.toString());
            params.set("view", mode);
            const qs = params.toString();
            router.replace(qs ? `/boards/${boardId}?${qs}` : `/boards/${boardId}`, {
              scroll: false,
            });
          }}
          className="ms-2"
        >
          <TabsList className="h-8">
            <TabsTrigger value="KANBAN" className="cursor-pointer gap-1.5 px-2.5 text-xs">
              <Columns3 className="size-3.5" />
              <span className="sr-only sm:not-sr-only sm:inline">{tViews("kanban")}</span>
            </TabsTrigger>
            <TabsTrigger value="TABLE" className="cursor-pointer gap-1.5 px-2.5 text-xs">
              <Table2 className="size-3.5" />
              <span className="sr-only sm:not-sr-only sm:inline">{tViews("table")}</span>
            </TabsTrigger>
            <TabsTrigger value="CALENDAR" className="cursor-pointer gap-1.5 px-2.5 text-xs">
              <CalendarDays className="size-3.5" />
              <span className="sr-only sm:not-sr-only sm:inline">{tViews("calendar")}</span>
            </TabsTrigger>
            <TabsTrigger value="TIMELINE" className="cursor-pointer gap-1.5 px-2.5 text-xs">
              <GanttChart className="size-3.5" />
              <span className="sr-only sm:not-sr-only sm:inline">{tViews("timeline")}</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="ms-auto flex flex-wrap items-center gap-2">
          <BoardPresenceStrip boardId={boardId} />
          <BoardFiltersBar
            filters={filters}
            onChange={(next) => {
              setFilters(next);
              updatePrefs.mutate({ filters: next });
            }}
            members={members.map((m) => ({
              id: m.userId,
              username: m.user?.username ?? m.userId.slice(0, 6),
            }))}
            labels={labels}
          />
          <Button
            variant="outline"
            size="icon-sm"
            className="cursor-pointer"
            aria-label={tBrief("boardTitle")}
            title={tBrief("boardTitle")}
            onClick={() => setBriefOpen(true)}
          >
            <ListChecks className="size-4" />
          </Button>
          <BoardShareDialog boardId={boardId} />
          <AutomationsSheet boardId={boardId} columns={columns} />
          <BoardGithubSheet boardId={boardId} />
          {board && <BoardManageMenu board={board} />}
          <Button
            variant="outline"
            size="icon-sm"
            className="cursor-pointer"
            aria-label={t("members")}
            title={t("members")}
            onClick={() => setMembersOpen(true)}
          >
            <Users className="size-4" />
          </Button>
        </div>
      </header>

      <div className={cn("min-h-0 flex-1", viewMode === "KANBAN" && "overflow-hidden")}>
        {viewMode === "KANBAN" && (
          <BoardKanban
            boardId={boardId}
            filteredColumns={filteredColumns}
            isLoadingColumns={isLoading}
            openCardId={openCardId}
            onOpenCardChange={setOpenCard}
          />
        )}
        {viewMode === "TABLE" && (
          <BoardTableView
            boardId={boardId}
            columns={filteredColumns}
            onOpenCard={(id) => setOpenCard(id)}
          />
        )}
        {viewMode === "CALENDAR" && (
          <BoardCalendarView
            columns={filteredColumns}
            onOpenCard={(id) => setOpenCard(id)}
          />
        )}
        {viewMode === "TIMELINE" && (
          <BoardTimelineView
            columns={filteredColumns}
            dependencies={dependencies}
            onOpenCard={(id) => setOpenCard(id)}
          />
        )}
      </div>

      {viewMode !== "KANBAN" && (
        <CardDetailModal
          cardId={openCardId}
          boardId={boardId}
          open={!!openCardId}
          onOpenChange={(open) => {
            if (!open) setOpenCard(null);
          }}
        />
      )}

      <BoardBriefDialog
        boardId={boardId}
        open={briefOpen}
        onOpenChange={setBriefOpen}
        onOpenCard={setOpenCard}
      />

      <BoardMembersDialog
        boardId={boardId}
        workspaceId={board?.workspaceId}
        open={membersOpen}
        onOpenChange={setMembersOpen}
      />
    </div>
  );
}
