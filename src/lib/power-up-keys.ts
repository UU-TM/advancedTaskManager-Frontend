import type { BoardPowerUp } from "@/types/domain";

export function snapshotKey(snapshot: unknown): string | null {
  if (!snapshot || typeof snapshot !== "object") return null;
  const key = (snapshot as { key?: unknown }).key;
  return typeof key === "string" ? key : null;
}

/** True only after the pack is added to the board and switched on. */
export function isPowerUpEnabled(
  powerUps: BoardPowerUp[],
  key: string,
): boolean {
  return powerUps.some(
    (powerUp) =>
      powerUp.attached &&
      powerUp.enabled &&
      snapshotKey(powerUp.snapshot) === key,
  );
}
