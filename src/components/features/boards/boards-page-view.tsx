"use client";

import { Trello } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useBoards } from "@/hooks/use-boards";
import { useEnsureWorkspace } from "@/hooks/use-ensure-workspace";
import { useFavoriteBoards } from "@/hooks/use-favorite-boards";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BoardCard } from "./board-card";
import { CreateBoardDialog } from "./create-board-dialog";

function BoardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="p-5">
          <Skeleton className="mb-4 h-5 w-2/3" />
          <Skeleton className="mb-2 h-1.5 w-full" />
          <Skeleton className="mb-4 h-3 w-1/3" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="size-7 rounded-full" />
          </div>
        </Card>
      ))}
    </div>
  );
}

/**
 * Boards listing view — default post-login landing.
 */
export function BoardsPageView() {
  const { user } = useAuth();
  const {
    workspaceId,
    isLoading: workspaceLoading,
    isError: workspaceError,
    error: workspaceErr,
  } = useEnsureWorkspace();
  const {
    data: boards,
    isLoading: boardsLoading,
    isError: boardsError,
    error: boardsErr,
  } = useBoards(workspaceId);
  const { isFavorite, toggleFavorite } = useFavoriteBoards();

  const loading = workspaceLoading || (!!workspaceId && boardsLoading);
  const errorMessage =
    (workspaceError &&
      (workspaceErr instanceof Error
        ? workspaceErr.message
        : "Failed to load workspace")) ||
    (boardsError &&
      (boardsErr instanceof Error ? boardsErr.message : "Failed to load boards")) ||
    null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Boards</h1>
          <p className="text-sm text-muted-foreground">
            Pick a board to open its kanban view.
          </p>
        </div>
        {workspaceId && <CreateBoardDialog workspaceId={workspaceId} />}
      </div>

      {errorMessage && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {loading && <BoardsSkeleton />}

      {!loading && !errorMessage && boards && boards.length === 0 && (
        <Card className="border-dashed">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-md bg-primary/15 text-primary">
                <Trello className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base">No boards yet</CardTitle>
                <CardDescription>
                  Create your first board to start organizing work.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {!loading && !errorMessage && boards && boards.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <BoardCard
              key={board.id}
              board={board}
              favorite={isFavorite(board.id)}
              onToggleFavorite={toggleFavorite}
              member={user}
            />
          ))}
        </div>
      )}
    </div>
  );
}
