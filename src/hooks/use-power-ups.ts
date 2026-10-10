"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { powerUpsApi } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { isPowerUpEnabled } from "@/lib/power-up-keys";

export const powerUpKeys = {
  byBoard: (boardId: string) => ["power-ups", boardId] as const,
  enabled: () => ["power-ups", "enabled"] as const,
};

export function useBoardPowerUps(boardId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: powerUpKeys.byBoard(boardId ?? ""),
    queryFn: () => powerUpsApi.listByBoard(boardId!),
    enabled: !!boardId && enabled,
  });
}

export function usePowerUpEnabled(
  boardId: string | undefined,
  key: string,
): boolean {
  const { data: powerUps = [] } = useBoardPowerUps(boardId);
  return isPowerUpEnabled(powerUps, key);
}

/** True when this key is switched on for any board the user can open. */
export function usePowerUpEnabledAnywhere(key: string): boolean {
  const { isAuthenticated } = useAuth();
  const { data } = useQuery({
    queryKey: powerUpKeys.enabled(),
    queryFn: () => powerUpsApi.enabledKeys(),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
  return data?.keys.includes(key) ?? false;
}

export function usePowerUpMutations(boardId: string) {
  const qc = useQueryClient();
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: powerUpKeys.byBoard(boardId) });
    void qc.invalidateQueries({ queryKey: powerUpKeys.enabled() });
  };
  return {
    enable: useMutation({
      mutationFn: (packId: string) =>
        powerUpsApi.enable(boardId, { packId, enabled: true }),
      onSuccess: invalidate,
    }),
    toggle: useMutation({
      mutationFn: ({ packId, enabled }: { packId: string; enabled: boolean }) =>
        powerUpsApi.update(boardId, packId, { enabled }),
      onSuccess: invalidate,
    }),
    disable: useMutation({
      mutationFn: (packId: string) => powerUpsApi.disable(boardId, packId),
      onSuccess: invalidate,
    }),
  };
}
