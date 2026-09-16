"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { timeEntriesApi } from "@/lib/api";

export const timeEntryKeys = {
  all: ["time-entries"] as const,
  active: () => [...timeEntryKeys.all, "active"] as const,
  list: () => [...timeEntryKeys.all, "list"] as const,
};

export function useActiveTimeEntry() {
  return useQuery({
    queryKey: timeEntryKeys.active(),
    queryFn: () => timeEntriesApi.active(),
    refetchInterval: 30_000,
  });
}

export function useTimeEntryHistory(limit = 20) {
  return useQuery({
    queryKey: timeEntryKeys.list(),
    queryFn: () => timeEntriesApi.list(limit),
  });
}

function useInvalidateTime() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: timeEntryKeys.all });
  };
}

export function useStartTimeEntry() {
  const invalidate = useInvalidateTime();
  return useMutation({
    mutationFn: (cardId?: string) => timeEntriesApi.start(cardId),
    onSuccess: invalidate,
  });
}

export function usePauseTimeEntry() {
  const invalidate = useInvalidateTime();
  return useMutation({
    mutationFn: () => timeEntriesApi.pause(),
    onSuccess: invalidate,
  });
}

export function useResumeTimeEntry() {
  const invalidate = useInvalidateTime();
  return useMutation({
    mutationFn: () => timeEntriesApi.resume(),
    onSuccess: invalidate,
  });
}

export function useStopTimeEntry() {
  const invalidate = useInvalidateTime();
  return useMutation({
    mutationFn: () => timeEntriesApi.stop(),
    onSuccess: invalidate,
  });
}
