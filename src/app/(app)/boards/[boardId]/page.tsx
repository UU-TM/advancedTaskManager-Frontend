"use client";

import { BoardShell } from "@/components/features/board-views/board-shell";
import { useParams } from "next/navigation";

export default function BoardDetailPage() {
  const params = useParams<{ boardId: string }>();
  return <BoardShell boardId={params.boardId} />;
}
