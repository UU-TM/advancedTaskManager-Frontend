"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "kanban.favoriteBoards";

function readFavorites(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === "string"));
  } catch {
    return new Set();
  }
}

function writeFavorites(ids: Set<string>) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

/**
 * Favorite board IDs persisted in localStorage until the backend supports it.
 */
export function useFavoriteBoards() {
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setFavorites(readFavorites());
  }, []);

  const isFavorite = useCallback(
    (boardId: string) => favorites.has(boardId),
    [favorites],
  );

  const toggleFavorite = useCallback((boardId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(boardId)) next.delete(boardId);
      else next.add(boardId);
      writeFavorites(next);
      return next;
    });
  }, []);

  return { isFavorite, toggleFavorite };
}
