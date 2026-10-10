"use client";

import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { boardArchivedKey, useBoardArchived } from "@/hooks/use-boards";
import { useUnarchiveCard } from "@/hooks/use-card";
import { useColumns, useUnarchiveColumn } from "@/hooks/use-columns";
import { PanelFrame } from "./panel-frame";

export function ArchivedPanel({
  boardId,
  onBack,
}: {
  boardId: string;
  onBack: () => void;
}) {
  const t = useTranslations("kanban.boardMenu.archived");
  const qc = useQueryClient();
  const { data, isLoading, isError } = useBoardArchived(boardId);
  const { data: activeColumns = [] } = useColumns(boardId);
  const unarchiveCard = useUnarchiveCard();
  const unarchiveColumn = useUnarchiveColumn();

  const columnTitles = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of activeColumns) map.set(c.id, c.title);
    for (const c of data?.columns ?? []) map.set(c.id, c.title);
    return map;
  }, [activeColumns, data?.columns]);

  const refresh = () =>
    void qc.invalidateQueries({ queryKey: boardArchivedKey(boardId) });

  const cards = data?.cards ?? [];
  const columns = data?.columns ?? [];

  return (
    <PanelFrame
      title={t("title")}
      description={t("description")}
      onBack={onBack}
    >
      <div className="pt-4">
        {isLoading && <Skeleton className="h-24 w-full" />}
        {isError && (
          <p className="text-sm text-destructive">{t("loadFailed")}</p>
        )}
        {data && (
          <Tabs defaultValue="cards">
            <TabsList className="w-full">
              <TabsTrigger value="cards" className="flex-1 cursor-pointer">
                {t("cards")} ({cards.length})
              </TabsTrigger>
              <TabsTrigger value="columns" className="flex-1 cursor-pointer">
                {t("columns")} ({columns.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cards" className="mt-3">
              {cards.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("emptyCards")}
                </p>
              ) : (
                <ul className="space-y-2">
                  {cards.map((card) => (
                    <li
                      key={card.id}
                      className="flex items-center gap-2 rounded-md border border-border/70 bg-card p-2.5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium" dir="auto">
                          {card.title}
                        </p>
                        {columnTitles.get(card.columnId) && (
                          <p className="truncate text-xs text-muted-foreground">
                            {t("inList", {
                              list: columnTitles.get(card.columnId) ?? "",
                            })}
                          </p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                        disabled={unarchiveCard.isPending}
                        onClick={() =>
                          unarchiveCard.mutate(
                            { id: card.id, columnId: card.columnId },
                            {
                              onSuccess: () => {
                                toast.success(t("cardRestored"));
                                refresh();
                              },
                              onError: () => toast.error(t("failed")),
                            },
                          )
                        }
                      >
                        <RotateCcw className="me-1.5 size-3.5" />
                        {t("restore")}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>

            <TabsContent value="columns" className="mt-3">
              {columns.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("emptyColumns")}
                </p>
              ) : (
                <ul className="space-y-2">
                  {columns.map((column) => (
                    <li
                      key={column.id}
                      className="flex items-center gap-2 rounded-md border border-border/70 bg-card p-2.5"
                    >
                      <p
                        className="min-w-0 flex-1 truncate text-sm font-medium"
                        dir="auto"
                      >
                        {column.title}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                        disabled={unarchiveColumn.isPending}
                        onClick={() =>
                          unarchiveColumn.mutate(
                            { id: column.id, boardId },
                            {
                              onSuccess: () => {
                                toast.success(t("columnRestored"));
                                refresh();
                              },
                              onError: () => toast.error(t("failed")),
                            },
                          )
                        }
                      >
                        <RotateCcw className="me-1.5 size-3.5" />
                        {t("restore")}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </PanelFrame>
  );
}
