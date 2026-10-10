"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { loadLibraryFromBlob } from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { Check, Loader2, Search, Shapes } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  fetchWhiteboardLibraryCatalog,
  getInstalledLibraryPackIds,
  markLibraryPackInstalled,
  type WhiteboardLibraryCatalogItem,
} from "./library-persistence";

type WhiteboardLibraryStoreProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  api: ExcalidrawImperativeAPI | null;
};

export function WhiteboardLibraryStore({
  open,
  onOpenChange,
  api,
}: WhiteboardLibraryStoreProps) {
  const t = useTranslations("whiteboard.libraryStore");
  const [libraries, setLibraries] = useState<WhiteboardLibraryCatalogItem[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [installedIds, setInstalledIds] = useState<string[]>([]);
  const [installingId, setInstallingId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setInstalledIds(getInstalledLibraryPackIds());
    let cancelled = false;
    setLoading(true);
    void fetchWhiteboardLibraryCatalog()
      .then((catalog) => {
        if (!cancelled) setLibraries(catalog.libraries ?? []);
      })
      .catch(() => {
        if (!cancelled) toast.error(t("loadFailed"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, t]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return libraries;
    return libraries.filter((lib) => {
      const hay = [
        lib.name,
        lib.description,
        ...(lib.authors?.map((a) => a.name) ?? []),
        ...(lib.itemNames ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [libraries, query]);

  async function install(lib: WhiteboardLibraryCatalogItem) {
    if (!api || installingId) return;
    setInstallingId(lib.id);
    try {
      const res = await fetch(lib.source);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const items = await loadLibraryFromBlob(blob, "published");
      await api.updateLibrary({
        libraryItems: items,
        merge: true,
        openLibraryMenu: true,
        defaultStatus: "published",
      });
      markLibraryPackInstalled(lib.id);
      setInstalledIds(getInstalledLibraryPackIds());
      toast.success(t("installedToast", { name: lib.name }));
    } catch {
      toast.error(t("installFailed"));
    } finally {
      setInstallingId(null);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b border-border px-4 py-4">
          <SheetTitle>{t("title")}</SheetTitle>
          <SheetDescription>{t("description")}</SheetDescription>
        </SheetHeader>

        <div className="border-b border-border px-4 py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("search")}
              className="ps-8"
              autoFocus
            />
          </div>
        </div>

        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-3 p-4">
            {loading && (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                {t("loading")}
              </div>
            )}

            {!loading && filtered.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground">
                <Shapes className="size-8 opacity-50" />
                <p>{t("empty")}</p>
              </div>
            )}

            {!loading &&
              filtered.map((lib) => {
                const installed = installedIds.includes(lib.id);
                const busy = installingId === lib.id;
                const authors =
                  lib.authors?.map((a) => a.name).filter(Boolean).join(", ") ||
                  null;

                return (
                  <article
                    key={lib.id}
                    className="overflow-hidden rounded-md border border-border bg-card"
                  >
                    <div className="flex gap-3 p-3">
                      <div className="relative size-16 shrink-0 overflow-hidden rounded-sm bg-muted">
                        {lib.preview ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={lib.preview}
                            alt=""
                            className="size-full object-contain"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center text-muted-foreground">
                            <Shapes className="size-6 opacity-40" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-medium leading-tight">
                          {lib.name}
                        </h3>
                        {authors && (
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {authors}
                          </p>
                        )}
                        {lib.description && (
                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                            {lib.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-end border-t border-border px-3 py-2">
                      <Button
                        size="sm"
                        variant={installed ? "secondary" : "default"}
                        className={cn("cursor-pointer", installed && "gap-1.5")}
                        disabled={!api || busy}
                        onClick={() => void install(lib)}
                      >
                        {busy ? (
                          <>
                            <Loader2 className="size-3.5 animate-spin" />
                            {t("installing")}
                          </>
                        ) : installed ? (
                          <>
                            <Check className="size-3.5" />
                            {t("installed")}
                          </>
                        ) : (
                          t("install")
                        )}
                      </Button>
                    </div>
                  </article>
                );
              })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
