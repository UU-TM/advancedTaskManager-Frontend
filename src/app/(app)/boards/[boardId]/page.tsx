"use client";

import { BoardShell } from "@/components/features/board-views/board-shell";
import { WhiteboardShell } from "@/components/features/whiteboard/whiteboard-shell";
import { useBoard } from "@/hooks/use-boards";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function BoardDetailPage() {
  const params = useParams<{ boardId: string }>();
  const { data: board, isLoading } = useBoard(params.boardId);

  if (isLoading || !board) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[60vh] w-full rounded-md" />
      </div>
    );
  }

  if (board.kind === "WHITEBOARD") {
    return <WhiteboardShell boardId={params.boardId} />;
  }

  return <BoardShell boardId={params.boardId} />;
}
