"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { presenceApi } from "@/lib/api";

export const presenceKeys = {
  all: ["presence"] as const,
  board: (boardId: string) => [...presenceKeys.all, boardId] as const,
};

export function useBoardPresence(boardId: string | undefined) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: presenceKeys.board(boardId ?? ""),
    queryFn: () => presenceApi.list(boardId!),
    enabled: !!boardId,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    if (!boardId) return;
    let cancelled = false;

    async function beat() {
      try {
        const data = await presenceApi.heartbeat(boardId!);
        if (!cancelled) {
          qc.setQueryData(presenceKeys.board(boardId!), data);
        }
      } catch {
        // ignore transient heartbeat failures
      }
    }

    void beat();
    const id = window.setInterval(() => void beat(), 20_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [boardId, qc]);

  return query;
}
