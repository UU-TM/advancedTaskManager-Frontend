"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppBreadcrumbs } from "@/components/layout/app-breadcrumbs";
import { BoardMembersDialog } from "@/components/features/kanban/BoardMembersDialog";
import { BoardManageMenu } from "@/components/features/kanban/BoardManageMenu";
import { BoardShareDialog } from "@/components/features/board-views/board-share-dialog";
import { useBoard } from "@/hooks/use-boards";
import { WhiteboardView } from "./whiteboard-view";

type WhiteboardShellProps = {
  boardId: string;
};

export function WhiteboardShell({ boardId }: WhiteboardShellProps) {
  const t = useTranslations("whiteboard");
  const tKanban = useTranslations("kanban");
  const { data: board } = useBoard(boardId);
  const [membersOpen, setMembersOpen] = useState(false);

  return (
    <div className="flex h-[calc(100dvh-3rem)] flex-col">
      <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border bg-card px-4 py-2.5 md:px-6">
        <Button asChild variant="ghost" size="sm" className="cursor-pointer">
          <Link href="/boards">
            <ArrowLeft className="me-2 size-4 rtl:rotate-180" />
            {tKanban("boards")}
          </Link>
        </Button>
        <AppBreadcrumbs boardName={board?.name} />
        <h1 className="truncate text-base font-semibold tracking-tight">
          {board?.name ?? t("loading")}
        </h1>
        <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {t("badge")}
        </span>
        <div className="ms-auto flex flex-wrap items-center gap-2">
          <BoardShareDialog boardId={boardId} />
          {board && <BoardManageMenu board={board} />}
          <Button
            variant="outline"
            size="icon-sm"
            className="cursor-pointer"
            aria-label={tKanban("members")}
            title={tKanban("members")}
            onClick={() => setMembersOpen(true)}
          >
            <Users className="size-4" />
          </Button>
        </div>
      </header>

      <div className="min-h-0 flex-1">
        <WhiteboardView boardId={boardId} />
      </div>

      <BoardMembersDialog
        boardId={boardId}
        workspaceId={board?.workspaceId}
        open={membersOpen}
        onOpenChange={setMembersOpen}
      />
    </div>
  );
}
