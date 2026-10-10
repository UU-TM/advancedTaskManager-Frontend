"use client";

import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/use-auth";
import { useBoards } from "@/hooks/use-boards";
import { useActiveWorkspace } from "@/components/layout/active-workspace-context";
import {
  useStarBoard,
  useStarredBoards,
  useUnstarBoard,
} from "@/hooks/use-home";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageSkeletonCards } from "@/components/ui/page-skeleton";
import { PageHeader } from "@/components/ui/page-header";
import { BoardCard } from "./board-card";
import { CreateBoardDialog } from "./create-board-dialog";
import { useMemo } from "react";

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

      {loading && <PageSkeletonCards />}

      {!loading && !errorMessage && boards && boards.length === 0 && (
        <div className="max-w-md py-6">
          <p className="text-base font-semibold">{t("emptyTitle")}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {t("emptyDescription")}
          </p>
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
            />
          ))}
        </div>
      )}
    </div>
  );
}
