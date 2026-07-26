"use client";

import { useParams } from "next/navigation";
import { BoardKanban } from "@/components/features/kanban/BoardKanban";

export default function BoardDetailPage() {
  const params = useParams<{ boardId: string }>();
  const boardId = params.boardId;

  return <BoardKanban boardId={boardId} />;
}
