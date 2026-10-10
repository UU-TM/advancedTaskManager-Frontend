"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Column } from "./Column";
import { InlineColumnComposer } from "./InlineColumnComposer";
import { CardDetailModal } from "./CardDetailModal";
import { TaskCardBody } from "./TaskCardBody";
import {
  findCardPlacement,
  insertionIndex,
  readColumnCards,
  relocateCard,
  restoreCardDrag,
  snapshotCardDrag,
  type CardDragSnapshot,
} from "./card-drag";
import {
  useArchiveCard,
  useCopyCard,
  useDeleteCard,
  useMoveCard,
  useUnarchiveCard,
} from "@/hooks/use-card";
import {
  useArchiveColumn,
  useColumns,
  useCreateColumn,
  useDeleteColumn,
  useMoveColumn,
  useUnarchiveColumn,
  useUpdateColumn,
} from "@/hooks/use-columns";
import { boardAmbientTone, wallpaperInk } from "@/lib/board-ambient";
import type { Board, BoardColumn, Card } from "@/types/domain";
import { KanbanColumnSkeleton } from "@/components/ui/kanban-column-skeleton";
import { cn } from "@/lib/utils";

type BoardKanbanProps = {
  boardId: string;
  /** Board entity — label prefs and other board settings. */
  board?: Board | null;
  filteredColumns?: BoardColumn[];
  isLoadingColumns?: boolean;
  openCardId?: string | null;
  onOpenCardChange?: (id: string | null) => void;
};

export function BoardKanban({
  boardId,
  board,
  filteredColumns,
  isLoadingColumns,
  openCardId: controlledOpenCardId,
  onOpenCardChange,
}: BoardKanbanProps) {
  const t = useTranslations("kanban");
  const tCommon = useTranslations("common");
  const queryClient = useQueryClient();
  const {
    data: fetchedColumns = [],
    isLoading: fetching,
    isError,
  } = useColumns(boardId);
  const columns = filteredColumns ?? fetchedColumns;
  const isLoading = isLoadingColumns ?? fetching;

  const moveCard = useMoveCard();
  const archiveCard = useArchiveCard();
  const unarchiveCard = useUnarchiveCard();
  const deleteCard = useDeleteCard();
  const copyCard = useCopyCard();
  const updateColumn = useUpdateColumn();
  const archiveColumn = useArchiveColumn();
  const unarchiveColumn = useUnarchiveColumn();
  const deleteColumn = useDeleteColumn();
  const moveColumn = useMoveColumn();
  const createColumn = useCreateColumn();

  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [activeColumn, setActiveColumn] = useState<BoardColumn | null>(null);
  const [internalOpenCardId, setInternalOpenCardId] = useState<string | null>(
    null,
  );
  const [overColumnId, setOverColumnId] = useState<string | null>(null);
  const dragOrigin = useRef<Card | null>(null);
  const dragSnapshot = useRef<CardDragSnapshot | null>(null);

  const openCardId =
    controlledOpenCardId !== undefined
      ? controlledOpenCardId
      : internalOpenCardId;
  const setOpenCardId = onOpenCardChange ?? setInternalOpenCardId;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const columnIds = useMemo(() => columns.map((c) => c.id), [columns]);

  function clearDrag() {
    setActiveCard(null);
    setActiveColumn(null);
    setOverColumnId(null);
    dragOrigin.current = null;
    dragSnapshot.current = null;
  }

  function restoreDrag() {
    if (dragSnapshot.current) {
      restoreCardDrag(queryClient, dragSnapshot.current);
    }
  }

  function handleDragStart(event: DragStartEvent) {
    const type = event.active.data.current?.type;
    if (type === "card") {
      const card = event.active.data.current?.card as Card;
      if (card.id.startsWith("temp-")) return;
      setActiveCard(card);
      setActiveColumn(null);
      dragOrigin.current = card;
      dragSnapshot.current = snapshotCardDrag(queryClient, boardId, columnIds);
    } else if (type === "column") {
      setActiveColumn(event.active.data.current?.column as BoardColumn);
      setActiveCard(null);
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over || active.data.current?.type !== "card") {
      setOverColumnId(null);
      return;
    }
    const origin = dragOrigin.current;
    if (!origin) {
      setOverColumnId(null);
      return;
    }

    const overType = over.data.current?.type as string | undefined;
    let targetColumnId: string | null = null;
    if (overType === "column-drop") {
      targetColumnId = (over.data.current?.columnId as string) ?? null;
    } else if (overType === "column") {
      targetColumnId = String(over.id);
    } else if (overType === "card") {
      targetColumnId =
        (over.data.current?.card as Card | undefined)?.columnId ?? null;
    } else if (String(over.id).startsWith("droppable-")) {
      targetColumnId = String(over.id).replace("droppable-", "");
    }

    if (!targetColumnId || targetColumnId.startsWith("temp-")) {
      setOverColumnId(null);
      return;
    }

    const current = findCardPlacement(
      queryClient,
      boardId,
      columnIds,
      origin.id,
    );
    const currentColumnId = current?.columnId ?? origin.columnId;
    if (
      currentColumnId === targetColumnId &&
      origin.columnId === targetColumnId
    ) {
      setOverColumnId(targetColumnId);
      return;
    }

    const targetCards = readColumnCards(queryClient, boardId, targetColumnId);
    let overCardId: string | null = null;
    let placeAfter = false;
    if (overType === "card" && String(over.id) !== origin.id) {
      overCardId = String(over.id);
      const translatedTop = active.rect.current.translated?.top;
      const mid = over.rect.top + over.rect.height / 2;
      placeAfter = translatedTop != null && translatedTop > mid;
    }
    const insertAt = insertionIndex(
      targetCards,
      origin.id,
      overCardId,
      placeAfter,
    );
    if (
      current &&
      current.columnId === targetColumnId &&
      current.index === insertAt
    ) {
      setOverColumnId(targetColumnId);
      return;
    }

    relocateCard(
      queryClient,
      boardId,
      columnIds,
      origin.id,
      targetColumnId,
      insertAt,
    );
    setOverColumnId(targetColumnId);
  }

  function handleDragCancel() {
    restoreDrag();
    clearDrag();
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    const origin = dragOrigin.current;
    const snapshot = dragSnapshot.current;
    const activeType = active.data.current?.type as string | undefined;

    if (activeType === "column") {
      clearDrag();
      if (!over || active.id === over.id) return;

      const activeIndex = columns.findIndex((c) => c.id === active.id);
      let overIndex = columns.findIndex((c) => c.id === over.id);
      if (overIndex === -1 && String(over.id).startsWith("droppable-")) {
        overIndex = columns.findIndex(
          (c) => c.id === String(over.id).replace("droppable-", ""),
        );
      }
      if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) {
        return;
      }

      const afterColumnId =
        overIndex > activeIndex
          ? columns[overIndex]?.id
          : columns[overIndex - 1]?.id;
      const beforeColumnId =
        overIndex < activeIndex
          ? columns[overIndex]?.id
          : columns[overIndex + 1]?.id;

      const input =
        overIndex > activeIndex ? { afterColumnId } : { beforeColumnId };

      moveColumn.mutate(
        { id: String(active.id), boardId, input },
        {
          onError: () => toast.error(t("failedReorderColumn")),
        },
      );
      return;
    }

    if (activeType !== "card" || !origin) {
      clearDrag();
      return;
    }

    const placed = findCardPlacement(
      queryClient,
      boardId,
      columnIds,
      origin.id,
    );
    const movedAcross = !!placed && placed.columnId !== origin.columnId;

    if (!over) {
      restoreDrag();
      clearDrag();
      return;
    }

    if (movedAcross && placed) {
      const list = readColumnCards(queryClient, boardId, placed.columnId);
      const index = list.findIndex((card) => card.id === origin.id);
      const next = list
        .slice(index + 1)
        .find((card) => !card.id.startsWith("temp-"));
      const prev = [...list.slice(0, index)]
        .reverse()
        .find((card) => !card.id.startsWith("temp-"));
      clearDrag();
      moveCard.mutate(
        {
          id: origin.id,
          sourceColumnId: origin.columnId,
          input: {
            columnId: placed.columnId,
            ...(next
              ? { beforeCardId: next.id }
              : prev
                ? { afterCardId: prev.id }
                : {}),
          },
        },
        {
          onError: () => {
            if (snapshot) restoreCardDrag(queryClient, snapshot);
            toast.error(t("failedMoveCard"));
          },
        },
      );
      return;
    }

    if (snapshot) restoreCardDrag(queryClient, snapshot);
    clearDrag();
    if (active.id === over.id) return;

    const card = origin;
    const sourceColumnId = card.columnId;
    const overType = over.data.current?.type as string | undefined;

    let targetColumnId: string | null = null;
    if (overType === "column-drop") {
      targetColumnId = over.data.current?.columnId as string;
    } else if (overType === "column") {
      targetColumnId = String(over.id);
    } else if (overType === "card") {
      targetColumnId = (over.data.current?.card as Card).columnId;
    } else if (String(over.id).startsWith("droppable-")) {
      targetColumnId = String(over.id).replace("droppable-", "");
    }
    if (!targetColumnId || targetColumnId.startsWith("temp-")) return;

    let afterCardId: string | undefined;
    let beforeCardId: string | undefined;

    if (overType === "card" && over.id !== active.id) {
      const overCard = over.data.current?.card as Card | undefined;
      const sameColumn = targetColumnId === sourceColumnId;
      const movingDown =
        sameColumn &&
        overCard != null &&
        (card.position ?? 0) < (overCard.position ?? 0);
      if (movingDown) afterCardId = String(over.id);
      else beforeCardId = String(over.id);
    }

    moveCard.mutate(
      {
        id: String(active.id),
        sourceColumnId,
        input: {
          columnId: targetColumnId,
          afterCardId,
          beforeCardId,
        },
      },
      {
        onError: () => toast.error(t("failedMoveCard")),
      },
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div
        dir="ltr"
        className="flex-1 overflow-x-auto overflow-y-hidden p-3 md:p-4"
      >
        {isLoading && <KanbanColumnSkeleton />}
        {isError && (
          <p className="text-sm text-destructive">{t("failedColumns")}</p>
        )}

        {!isLoading && !isError && columns.length === 0 && (
          <EmptyBoard board={board} boardId={boardId} createColumn={createColumn} />
        )}

        {!isLoading && !isError && columns.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <SortableContext
              items={columnIds}
              strategy={horizontalListSortingStrategy}
            >
              <div className="flex h-full w-max flex-row items-start gap-3">
                {columns.map((column) => (
                  <Column
                    key={column.id}
                    column={column}
                    columns={columns}
                    dragOver={overColumnId === column.id}
                    showLabelText={!!board?.prefs?.showLabelText}
                    onOpenCard={setOpenCardId}
                    onArchiveCard={(c) =>
                      archiveCard.mutate(
                        { id: c.id, columnId: c.columnId },
                        {
                          onError: () => toast.error(t("failedArchiveCard")),
                          onSuccess: () =>
                            toast.success(t("cardArchived"), {
                              action: {
                                label: tCommon("undo"),
                                onClick: () =>
                                  unarchiveCard.mutate(
                                    { id: c.id, columnId: c.columnId },
                                    {
                                      onSuccess: () =>
                                        toast.success(t("cardRestored")),
                                      onError: () =>
                                        toast.error(t("failedArchiveCard")),
                                    },
                                  ),
                              },
                            }),
                        },
                      )
                    }
                    onDeleteCard={(c) =>
                      deleteCard.mutate(
                        { id: c.id, columnId: c.columnId },
                        {
                          onError: () => toast.error(t("failedDeleteCard")),
                          onSuccess: () => toast.success(t("cardDeleted")),
                        },
                      )
                    }
                    onCopyCard={(c) =>
                      copyCard.mutate(
                        {
                          id: c.id,
                          input: {
                            columnId: c.columnId,
                            includeChecklists: true,
                            includeLabels: true,
                          },
                        },
                        {
                          onError: () => toast.error(t("failedCopyCard")),
                          onSuccess: () => toast.success(t("cardCopied")),
                        },
                      )
                    }
                    onMoveCardTo={(c, columnId) =>
                      moveCard.mutate(
                        {
                          id: c.id,
                          sourceColumnId: c.columnId,
                          input: { columnId },
                        },
                        {
                          onError: () => toast.error(t("failedMoveCard")),
                        },
                      )
                    }
                    onRename={(id, title) =>
                      updateColumn.mutate(
                        { id, boardId, input: { title } },
                        {
                          onError: () => toast.error(t("failedRenameColumn")),
                        },
                      )
                    }
                    onArchiveColumn={(id) =>
                      archiveColumn.mutate(
                        { id, boardId },
                        {
                          onSuccess: () =>
                            toast.success(t("columnArchived"), {
                              action: {
                                label: tCommon("undo"),
                                onClick: () =>
                                  unarchiveColumn.mutate(
                                    { id, boardId },
                                    {
                                      onSuccess: () =>
                                        toast.success(t("columnRestored")),
                                      onError: () =>
                                        toast.error(t("failedArchiveColumn")),
                                    },
                                  ),
                              },
                            }),
                          onError: () => toast.error(t("failedArchiveColumn")),
                        },
                      )
                    }
                    onDeleteColumn={(id) =>
                      deleteColumn.mutate(
                        { id, boardId },
                        {
                          onSuccess: () => toast.success(t("columnDeleted")),
                          onError: () => toast.error(t("failedDeleteColumn")),
                        },
                      )
                    }
                    onMoveColumn={(id, direction) => {
                      const idx = columns.findIndex((c) => c.id === id);
                      if (idx === -1) return;
                      const targetIdx =
                        direction === "left" ? idx - 1 : idx + 1;
                      if (targetIdx < 0 || targetIdx >= columns.length) return;
                      const input =
                        direction === "left"
                          ? { beforeColumnId: columns[targetIdx].id }
                          : { afterColumnId: columns[targetIdx].id };
                      moveColumn.mutate(
                        { id, boardId, input },
                        {
                          onError: () => toast.error(t("failedReorderColumn")),
                        },
                      );
                    }}
                  />
                ))}
                <InlineColumnComposer boardId={boardId} />
              </div>
            </SortableContext>

            <DragOverlay>
              {activeCard && (
                <div className="relative w-[256px] cursor-grabbing rotate-2 rounded-lg bg-card text-sm text-card-foreground shadow-[var(--kanban-card-shadow-hover)] opacity-95">
                  <TaskCardBody
                    card={activeCard}
                    showLabelText={!!board?.prefs?.showLabelText}
                  />
                </div>
              )}
              {activeColumn && (
                <div className="w-[272px] rounded-2xl bg-[var(--kanban-list-bg)] p-3 text-foreground opacity-95 shadow-[var(--kanban-list-shadow)]">
                  <p className="text-sm font-semibold">{activeColumn.title}</p>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      <CardDetailModal
        cardId={openCardId}
        boardId={boardId}
        open={!!openCardId}
        onOpenChange={(open) => {
          if (!open) setOpenCardId(null);
        }}
      />
    </div>
  );
}

function EmptyBoard({
  board,
  boardId,
  createColumn,
}: {
  board?: Board | null;
  boardId: string;
  createColumn: ReturnType<typeof useCreateColumn>;
}) {
  const t = useTranslations("kanban");
  const busy = useRef(false);
  const mounted = useRef(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  async function addStarter() {
    if (busy.current) return;
    busy.current = true;
    setStarting(true);
    const names = [t("starterTodo"), t("starterInProgress"), t("starterDone")];
    try {
      for (const name of names) {
        await createColumn.mutateAsync({ boardId, name });
      }
    } catch {
      toast.error(t("createColumnFailed"));
    } finally {
      busy.current = false;
      if (mounted.current) setStarting(false);
    }
  }

  const tone = boardAmbientTone(board);
  const ink = wallpaperInk(tone ? tone.dark : false);

  return (
    <div
      dir="auto"
      className="flex max-w-md flex-col items-start gap-4 py-6"
      style={{ color: ink }}
    >
      <div>
        <p className="text-base font-semibold">{t("emptyBoard.title")}</p>
        <p className="mt-1 text-sm opacity-80">
          {t("emptyBoard.description")}
        </p>
      </div>
      <button
        type="button"
        disabled={starting}
        onClick={() => void addStarter()}
        className={cn(
          "flex flex-wrap items-center gap-2 rounded-md border border-dashed border-current/35 px-3 py-2 text-start transition-colors hover:border-current/60",
          "disabled:opacity-60",
        )}
      >
        <span className="text-sm opacity-80">
          {t("useStarterColumns")}
        </span>
        <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
          {t("starterTodo")}
        </span>
        <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
          {t("starterInProgress")}
        </span>
        <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
          {t("starterDone")}
        </span>
      </button>
      <InlineColumnComposer boardId={boardId} defaultOpen />
    </div>
  );
}
