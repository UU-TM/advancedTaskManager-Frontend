import type { LibraryItems } from "@excalidraw/excalidraw/types";

const LIBRARY_ITEMS_KEY = "kanban-whiteboard-library-items";
const INSTALLED_PACKS_KEY = "kanban-whiteboard-library-packs";

export type WhiteboardLibraryCatalogItem = {
  id: string;
  name: string;
  description: string;
  authors: { name: string }[];
  itemNames: string[];
  source: string;
  preview: string | null;
};

export type WhiteboardLibraryCatalog = {
  libraries: WhiteboardLibraryCatalogItem[];
};

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export const whiteboardLibraryAdapter = {
  async load(): Promise<{ libraryItems: LibraryItems } | null> {
    const libraryItems = readJson<LibraryItems | null>(LIBRARY_ITEMS_KEY, null);
    if (!libraryItems?.length) return null;
    return { libraryItems };
  },
  async save({ libraryItems }: { libraryItems: LibraryItems }): Promise<void> {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      LIBRARY_ITEMS_KEY,
      JSON.stringify(libraryItems),
    );
  },
};

export function getInstalledLibraryPackIds(): string[] {
  return readJson<string[]>(INSTALLED_PACKS_KEY, []);
}

export function markLibraryPackInstalled(packId: string): void {
  if (typeof window === "undefined") return;
  const next = new Set(getInstalledLibraryPackIds());
  next.add(packId);
  window.localStorage.setItem(
    INSTALLED_PACKS_KEY,
    JSON.stringify([...next]),
  );
}

export async function fetchWhiteboardLibraryCatalog(): Promise<WhiteboardLibraryCatalog> {
  const res = await fetch("/whiteboard-libraries/catalog.json", {
    cache: "force-cache",
  });
  if (!res.ok) {
    throw new Error(`Failed to load library catalog (${res.status})`);
  }
  return (await res.json()) as WhiteboardLibraryCatalog;
}
