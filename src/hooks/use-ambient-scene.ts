"use client";

import { useLayoutEffect, useMemo } from "react";
import { useTheme } from "next-themes";
import { ambientSurfaceVars, boardAmbientTone } from "@/lib/board-ambient";
import { boardBackgroundStyle } from "@/lib/board-background";
import type { Board } from "@/types/domain";

/**
 * Board wallpaper and matching surface tints.
 * Only a board that has its own background paints the shell. Everywhere else
 * stays on the paper tokens in globals.css.
 */
export function useAmbientScene(
  board?: Pick<Board, "backgroundType" | "backgroundValue"> | null,
) {
  const { resolvedTheme } = useTheme();
  const themeDark = resolvedTheme === "dark";

  const scene = useMemo(() => {
    const tone = boardAmbientTone(board);
    const background = boardBackgroundStyle(board);
    if (!tone && !background) return { style: {} };
    return {
      style: {
        ...background,
        ...(tone ? ambientSurfaceVars(tone, themeDark) : {}),
      },
    };
  }, [board?.backgroundType, board?.backgroundValue, themeDark]);

  useLayoutEffect(() => {
    const root = document.documentElement;
    const keys: string[] = [];
    for (const [key, value] of Object.entries(scene.style)) {
      if (!key.startsWith("--") || typeof value !== "string") continue;
      root.style.setProperty(key, value);
      keys.push(key);
    }
    return () => {
      for (const key of keys) root.style.removeProperty(key);
    };
  }, [scene]);

  return scene;
}
