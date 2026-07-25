"use client";

/**
 * Boards page — grid of workspace boards with create dialog.
 * Data via TanStack Query; favorites in localStorage.
 */
import { BoardsPageView } from "@/components/features/boards";

export default function BoardsPage() {
  return <BoardsPageView />;
}
