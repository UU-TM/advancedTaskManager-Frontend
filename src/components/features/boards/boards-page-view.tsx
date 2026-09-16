"use client";

import { Trello } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/use-auth";
import { useBoards } from "@/hooks/use-boards";
import { useActiveWorkspace } from "@/components/layout/active-workspace-context";
import {
  useStarBoard,
  useStarredBoards,
  useUnstarBoard,
} from "@/hooks/use-home";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageHeader } from "@/components/ui/page-header";
import { BoardCard } from "./board-card";
import { CreateBoardDialog } from "./create-board-dialog";
import { useMemo } from "react";

function BoardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-5">
          <Skeleton className="mb-4 h-5 w-2/3" />
          <Skeleton className="mb-2 h-1.5 w-full" />
          <Skeleton className="mb-4 h-3 w-1/3" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="size-7 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Boards listing view — default post-login landing.
 */
export function BoardsPageView() {
  const t = useTranslations("boards");
  const tCommon = useTranslations("common");
  const { user } = useAuth();
  const {
    workspaceId,
    isLoading: workspaceLoading,
    isError: workspaceError,
    error: workspaceErr,
  } = useActiveWorkspace();
  const {
    data: boards,
    isLoading: boardsLoading,
    isError: boardsError,
    error: boardsErr,
  } = useBoards(workspaceId);
  const { data: starred = [] } = useStarredBoards();
  const star = useStarBoard();
  const unstar = useUnstarBoard();

  const starredIds = useMemo(
    () => new Set(starred.map((b) => b.id)),
    [starred],
  );

  const loading = workspaceLoading || (!!workspaceId && boardsLoading);
  const errorMessage =
    (workspaceError &&
      (workspaceErr instanceof Error
        ? workspaceErr.message
        : t("failedWorkspace"))) ||
    (boardsError &&
      (boardsErr instanceof Error ? boardsErr.message : t("failedBoards"))) ||
    null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
      <PageHeader
        title={t("title")}
        description={t("subtitle")}
        actions={
          workspaceId ? (
            <CreateBoardDialog workspaceId={workspaceId} />
          ) : undefined
        }
      />

      {errorMessage && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>{tCommon("somethingWentWrong")}</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {loading && <BoardsSkeleton />}

      {!loading && !errorMessage && boards && boards.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-card/50 px-6 py-10">
          <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-start">
            <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Trello className="size-5" />
            </div>
            <div>
              <p className="text-base font-semibold">{t("emptyTitle")}</p>
              <p className="text-sm text-muted-foreground">
                {t("emptyDescription")}
              </p>
            </div>
          </div>
        </div>
      )}

      {!loading && !errorMessage && boards && boards.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board, index) => (
            <BoardCard
              key={board.id}
              board={board}
              favorite={starredIds.has(board.id)}
              onToggleFavorite={(id) => {
                if (starredIds.has(id)) unstar.mutate(id);
                else star.mutate(id);
              }}
              member={user}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
}
