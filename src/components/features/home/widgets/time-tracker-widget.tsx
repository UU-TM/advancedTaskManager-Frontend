"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { MoreVertical, Pause, Play, Square, Timer } from "lucide-react";
import {
  useActiveTimeEntry,
  usePauseTimeEntry,
  useResumeTimeEntry,
  useStartTimeEntry,
  useStopTimeEntry,
  useTimeEntryHistory,
} from "@/hooks/use-time-entries";
import type { TimeEntry } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { WidgetShell } from "./widget-shell";

function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

function useDisplayElapsed(entry: TimeEntry | null | undefined): number {
  const fetchedAt = useRef(Date.now());
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    fetchedAt.current = Date.now();
  }, [entry?.id, entry?.elapsedMs, entry?.status, entry?.updatedAt]);

  useEffect(() => {
    if (!entry || entry.status !== "RUNNING") return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [entry?.id, entry?.status]);

  if (!entry) return 0;
  if (entry.status === "RUNNING") {
    return entry.elapsedMs + (now - fetchedAt.current);
  }
  return entry.elapsedMs;
}

export function TimeTrackerWidget() {
  const t = useTranslations("dashboard.timer");
  const { data: active, isLoading } = useActiveTimeEntry();
  const start = useStartTimeEntry();
  const pause = usePauseTimeEntry();
  const resume = useResumeTimeEntry();
  const stop = useStopTimeEntry();
  const [historyOpen, setHistoryOpen] = useState(false);
  const history = useTimeEntryHistory(30);
  const elapsed = useDisplayElapsed(active);

  async function handleReset() {
    if (active && active.status !== "STOPPED") {
      await stop.mutateAsync();
    }
  }

  return (
    <WidgetShell>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-base font-semibold">{t("title")}</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 cursor-pointer rounded-full bg-muted/60"
              aria-label={t("menu")}
            >
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!active || active.status === "STOPPED" ? (
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => void start.mutateAsync()}
              >
                {t("start")}
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => void handleReset()}
            >
              {t("reset")}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => setHistoryOpen(true)}
            >
              {t("history")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isLoading ? (
        <>
          <Skeleton className="mx-auto mb-8 h-12 w-52" />
          <div className="mt-auto flex items-center justify-center gap-4">
            <Skeleton className="size-12 rounded-full" />
            <Skeleton className="size-12 rounded-full" />
          </div>
        </>
      ) : (
        <>
      <p className="mb-8 text-center font-mono text-4xl font-semibold tracking-tight tabular-nums md:text-5xl">
        {active ? formatElapsed(elapsed) : t("noActive")}
      </p>

      <div className="mt-auto flex items-center justify-center gap-4">
        {active?.status === "RUNNING" ? (
          <Button
            variant="outline"
            size="icon"
            className="size-12 cursor-pointer rounded-full"
            aria-label={t("pause")}
            onClick={() => void pause.mutateAsync()}
          >
            <Pause className="size-5 fill-foreground" />
          </Button>
        ) : (
          <Button
            variant="outline"
            size="icon"
            className="size-12 cursor-pointer rounded-full"
            aria-label={active?.status === "PAUSED" ? t("resume") : t("start")}
            onClick={() =>
              void (active?.status === "PAUSED"
                ? resume.mutateAsync()
                : start.mutateAsync())
            }
          >
            <Play className="size-5 fill-foreground" />
          </Button>
        )}
        <Button
          size="icon"
          className="size-12 cursor-pointer rounded-full bg-red-500 text-white hover:bg-red-600"
          aria-label={t("stop")}
          disabled={!active || active.status === "STOPPED"}
          onClick={() => void stop.mutateAsync()}
        >
          <Square className="size-4 fill-white text-white" />
        </Button>
      </div>
        </>
      )}

      <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{t("historyTitle")}</SheetTitle>
          </SheetHeader>
          <ul className="mt-4 space-y-2 overflow-y-auto px-1">
            {history.isLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <li key={i}>
                  <Skeleton className="h-10 w-full rounded-lg" />
                </li>
              ))}
            {!history.isLoading &&
              (history.data ?? []).map((entry) => (
              <li
                key={entry.id}
                className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
              >
                <span className="font-mono tabular-nums">
                  {formatElapsed(entry.elapsedMs)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {entry.status}
                </span>
              </li>
            ))}
          </ul>
          {!history.isLoading && (history.data ?? []).length === 0 && (
            <EmptyState
              icon={Timer}
              title={t("emptyTitle")}
              description={t("emptyDescription")}
            />
          )}
        </SheetContent>
      </Sheet>
    </WidgetShell>
  );
}
