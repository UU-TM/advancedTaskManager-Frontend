"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getAccessToken, getClientApiBaseUrl } from "@/lib/api/client";
import { myWorkKeys } from "./use-my-work";
import { timeEntryKeys } from "./use-time-entries";
import { columnKeys } from "./use-columns";

/**
 * Authenticated SSE via fetch (EventSource cannot send Authorization headers).
 */
export function useBoardEvents(boardId?: string) {
  const qc = useQueryClient();
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!boardId) return;
    const token = getAccessToken();
    if (!token) return;

    const controller = new AbortController();
    abortRef.current = controller;

    void (async () => {
      try {
        const res = await fetch(`${getClientApiBaseUrl()}/boards/${boardId}/events`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        if (!res.ok || !res.body) return;
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";
          for (const part of parts) {
            const line = part
              .split("\n")
              .find((l) => l.startsWith("data: "));
            if (!line) continue;
            try {
              const event = JSON.parse(line.slice(6)) as { type?: string };
              if (event.type === "connected") continue;
              void qc.invalidateQueries({ queryKey: columnKeys.byBoard(boardId) });
              void qc.invalidateQueries({ queryKey: ["cards"] });
              void qc.invalidateQueries({ queryKey: ["board", boardId] });
              void qc.invalidateQueries({ queryKey: ["presence", boardId] });
              void qc.invalidateQueries({ queryKey: myWorkKeys.all });            } catch {
              // ignore malformed chunks
            }
          }
        }
      } catch {
        // aborted or network error — ignore
      }
    })();

    return () => {
      controller.abort();
    };
  }, [boardId, qc]);
}

export function useMeEvents(enabled = true) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!enabled) return;
    const token = getAccessToken();
    if (!token) return;

    const controller = new AbortController();

    void (async () => {
      try {
        const res = await fetch(`${getClientApiBaseUrl()}/me/events`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        if (!res.ok || !res.body) return;
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";
          for (const part of parts) {
            const line = part
              .split("\n")
              .find((l) => l.startsWith("data: "));
            if (!line) continue;
            try {
              const event = JSON.parse(line.slice(6)) as { type?: string };
              if (event.type === "connected") continue;
              if (event.type === "notification.created") {
                void qc.invalidateQueries({ queryKey: ["notifications"] });
              }
              void qc.invalidateQueries({ queryKey: myWorkKeys.all });
              void qc.invalidateQueries({ queryKey: timeEntryKeys.all });
            } catch {
              // ignore
            }
          }
        }
      } catch {
        // ignore
      }
    })();

    return () => controller.abort();
  }, [enabled, qc]);
}
