import type { CSSProperties } from "react";
import type { Board, BoardBackgroundType } from "@/types/domain";

export type BoardBackgroundPreset = {
  id: string;
  type: BoardBackgroundType;
  /** Persisted value: hex for COLOR, preset id for GRADIENT, public path for IMAGE. */
  value: string;
  /** i18n key under kanban.boardMenu.backgrounds */
  labelKey: string;
  css: string;
};

/** Muted paper / teal solids — aligned with the Kanban brand, not Trello blue. */
export const BOARD_COLOR_PRESETS: BoardBackgroundPreset[] = [
  { id: "paper", labelKey: "paper", value: "#e8eeeb" },
  { id: "sage", labelKey: "sage", value: "#cfe0d8" },
  { id: "mist", labelKey: "mist", value: "#d3e4e6" },
  { id: "teal", labelKey: "teal", value: "#9fcfc8" },
  { id: "deep-teal", labelKey: "deepTeal", value: "#115e59" },
  { id: "moss", labelKey: "moss", value: "#c9d6b8" },
  { id: "sand", labelKey: "sand", value: "#e6dccb" },
  { id: "clay", labelKey: "clay", value: "#e3c7b6" },
  { id: "slate", labelKey: "slate", value: "#cbd5d1" },
  { id: "ink", labelKey: "ink", value: "#1c2f2a" },
].map((c) => ({ ...c, type: "COLOR" as const, css: c.value }));

export const BOARD_GRADIENT_PRESETS: BoardBackgroundPreset[] = [
  {
    id: "lagoon",
    labelKey: "lagoon",
    css: "linear-gradient(135deg, #d3e4e6 0%, #9fcfc8 55%, #5fa8a0 100%)",
  },
  {
    id: "meadow",
    labelKey: "meadow",
    css: "linear-gradient(135deg, #e8eeeb 0%, #cfe0d8 50%, #b7cfa4 100%)",
  },
  {
    id: "dune",
    labelKey: "dune",
    css: "linear-gradient(135deg, #f3ece0 0%, #e6dccb 50%, #e3c7b6 100%)",
  },
  {
    id: "dusk",
    labelKey: "dusk",
    css: "linear-gradient(160deg, #1c2f2a 0%, #0f3d38 55%, #115e59 100%)",
  },
  {
    id: "ember",
    labelKey: "ember",
    css: "linear-gradient(135deg, #f3e3d6 0%, #e9b995 55%, #c2410c 140%)",
  },
  {
    id: "fog",
    labelKey: "fog",
    css: "linear-gradient(180deg, #f3f5f4 0%, #d5ded9 100%)",
  },
].map((g) => ({ ...g, type: "GRADIENT" as const, value: g.id }));

/** Photographic boards (Wikimedia Commons). Gradients stay in code so older boards still render. */
export const BOARD_IMAGE_PRESETS: BoardBackgroundPreset[] = [
  { id: "shore", labelKey: "shore", file: "shore.jpg" },
  { id: "forest", labelKey: "forest", file: "forest.jpg" },
  { id: "peaks", labelKey: "peaks", file: "peaks.jpg" },
  { id: "lake", labelKey: "lake", file: "lake.jpg" },
  { id: "mist-hills", labelKey: "mistHills", file: "mist.jpg" },
  { id: "dunes-photo", labelKey: "dunes", file: "dunes.jpg" },
  { id: "canyon", labelKey: "canyon", file: "canyon.jpg" },
  { id: "rim", labelKey: "rim", file: "rim.jpg" },
  { id: "autumn", labelKey: "autumn", file: "autumn.jpg" },
  { id: "meadow-photo", labelKey: "lavender", file: "meadow.jpg" },
  { id: "night", labelKey: "night", file: "night.jpg" },
  { id: "aurora", labelKey: "aurora", file: "aurora.jpg" },
].map(({ file, ...p }) => ({
  ...p,
  type: "IMAGE" as const,
  value: `/board-backgrounds/${file}`,
  css: `url(/board-backgrounds/${file})`,
}));

const HEX_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const IMAGE_RE = /^\/board-backgrounds\/[a-z0-9._-]+\.(?:svg|jpg|jpeg|png|webp)$/i;

export function findBoardBackgroundPreset(
  type: BoardBackgroundType | null | undefined,
  value: string | null | undefined,
): BoardBackgroundPreset | undefined {
  if (!type || !value) return undefined;
  const list =
    type === "COLOR"
      ? BOARD_COLOR_PRESETS
      : type === "GRADIENT"
        ? BOARD_GRADIENT_PRESETS
        : BOARD_IMAGE_PRESETS;
  return list.find((p) => p.value.toLowerCase() === value.toLowerCase());
}

/** Inline style for the board canvas; undefined when no (valid) background is set. */
export function boardBackgroundStyle(
  board: Pick<Board, "backgroundType" | "backgroundValue"> | null | undefined,
): CSSProperties | undefined {
  const type = board?.backgroundType;
  const value = board?.backgroundValue;
  if (!type || !value) return undefined;

  if (type === "COLOR") {
    return HEX_RE.test(value) ? { backgroundColor: value } : undefined;
  }
  if (type === "GRADIENT") {
    const preset = BOARD_GRADIENT_PRESETS.find((p) => p.id === value);
    return preset ? { backgroundImage: preset.css } : undefined;
  }
  if (IMAGE_RE.test(value)) {
    return {
      backgroundImage: `url(${value})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
  return undefined;
}
