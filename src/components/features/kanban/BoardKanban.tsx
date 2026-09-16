"use client";

import { useCallback, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
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
import { CreateColumnDialog } from "./CreateColumnDialog";
import { CardDetailModal } from "./CardDetailModal";
import { BoardMembersDialog } from "./BoardMembersDialog";
import { BoardManageMenu } from "./BoardManageMenu";
import {
  useArchiveCard,
  useCopyCard,
  useDeleteCard,
  useMoveCard,
} from "@/hooks/use-card";
import {
  useArchiveColumn,
  useColumns,
  useDeleteColumn,
  useMoveColumn,
  useUpdateColumn,
} from "@/hooks/use-columns";
import { useBoard } from "@/hooks/use-boards";
import type { BoardColumn, Card } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { KanbanColumnSkeleton } from "@/components/ui/kanban-column-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { AppBreadcrumbs } from "@/components/layout/app-breadcrumbs";
import { Users, Columns3 } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type BoardKanbanProps = {
  boardId: string;
  hideChrome?: boolean;
  filteredColumns?: BoardColumn[];
  isLoadingColumns?: boolean;
  openCardId?: string | null;
  onOpenCardChange?: (id: string | null) => void;
};

export function BoardKanban({
  boardId,
  hideChrome = false,
  filteredColumns,
  isLoadingColumns,
  openCardId: controlledOpenCardId,
  onOpenCardChange,
}: BoardKanbanProps) {
  const t = useTranslations("kanban");
  const { data: board } = useBoard(boardId);
  const {
    data: fetchedColumns = [],
    isLoading: fetching,
    isError,
  } = useColumns(boardId);
  const columns = filteredColumns ?? fetchedColumns;
  const isLoading = isLoadingColumns ?? fetching;

  const moveCard = useMoveCard();
  const archiveCard = useArchiveCard();
  const deleteCard = useDeleteCard();
  const copyCard = useCopyCard();
  const updateColumn = useUpdateColumn();
  const archiveColumn = useArchiveColumn();
  const deleteColumn = useDeleteColumn();
  const moveColumn = useMoveColumn();

  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [activeColumn, setActiveColumn] = useState<BoardColumn | null>(null);
  const [internalOpenCardId, setInternalOpenCardId] = useState<string | null>(
    null,
  );
  const [membersOpen, setMembersOpen] = useState(false);

  const openCardId =
    controlledOpenCardId !== undefined
      ? controlledOpenCardId
      : internalOpenCardId;
  const setOpenCardId = onOpenCardChange ?? setInternalOpenCardId;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const columnIds = useMemo(() => columns.map((c) => c.id), [columns]);

  const findColumnIdForCard = useCallback(
    (cardId: string, overId: string): string | null => {
      if (columns.some((c) => c.id === overId)) return overId;
      if (overId.startsWith("droppable-")) {
        return overId.replace("droppable-", "");
      }
      void cardId;
      return null;
    },
    [columns],
  );

  function handleDragStart(event: DragStartEvent) {
    const type = event.active.data.current?.type;
    if (type === "card") {
      setActiveCard(event.active.data.current?.card as Card);
      setActiveColumn(null);
    } else if (type === "column") {
      setActiveColumn(event.active.data.current?.column as BoardColumn);
      setActiveCard(null);
    }
  }

  function handleDragOver(_event: DragOverEvent) {
    // Optimistic UI is handled on drag end via mutation onMutate
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveCard(null);
    setActiveColumn(null);
    if (!over || active.id === over.id) return;

    const activeType = active.data.current?.type as string | undefined;

    if (activeType === "column") {
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
        overIndex > activeIndex
          ? { afterColumnId }
          : { beforeColumnId };

      moveColumn.mutate(
        { id: String(active.id), boardId, input },
        {
          onError: () => toast.error(t("failedReorderColumn")),
        },
      );
      return;
    }

    if (activeType === "card") {
      const card = active.data.current?.card as Card;
      const sourceColumnId = card.columnId;

      let targetColumnId: string | null = null;
      const overType = over.data.current?.type as string | undefined;

      if (overType === "column-drop") {
        targetColumnId = over.data.current?.columnId as string;
      } else if (overType === "column") {
        targetColumnId = String(over.id);
      } else if (overType === "card") {
        targetColumnId = (over.data.current?.card as Card).columnId;
      } else {
        targetColumnId = findColumnIdForCard(
          String(active.id),
          String(over.id),
        );
      }

      if (!targetColumnId) return;

      let afterCardId: string | undefined;
      let beforeCardId: string | undefined;

      if (overType === "card" && over.id !== active.id) {
        beforeCardId = String(over.id);
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
  }

  return (
    <div
      className={
        hideChrome
          ? "flex h-full flex-col"
          : "flex h-[calc(100dvh-3rem)] flex-col"
      }
    >
      {!hideChrome && (
      <header className="flex shrink-0 items-center gap-3 border-b border-border/80 bg-background/90 px-4 py-2.5 backdrop-blur-sm md:px-6">
        <Button asChild variant="ghost" size="sm" className="cursor-pointer">
          <Link href="/boards">
            <ArrowLeft className="me-2 size-4 rtl:rotate-180" />
            {t("boards")}
          </Link>
        </Button>
        <AppBreadcrumbs boardName={board?.name} />
        <h1 className="truncate text-base font-semibold tracking-tight sm:hidden md:text-lg">
          {board?.name ?? t("loadingBoard")}
        </h1>
        <div className="ms-auto flex items-center gap-2">
          {board && <BoardManageMenu board={board} />}
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={() => setMembersOpen(true)}
          >
            <Users className="me-2 size-4" />
            {t("members")}
          </Button>
        </div>
      </header>
      )}

      <div className="flex-1 overflow-x-auto overflow-y-hidden bg-muted/30 p-4 md:p-6">
        {isLoading && <KanbanColumnSkeleton />}
        {isError && (
          <p className="text-sm text-destructive">{t("failedColumns")}</p>
        )}

        {!isLoading && !isError && columns.length === 0 && (
          <EmptyState
            icon={Columns3}
            title={t("emptyBoard.title")}
            description={t("emptyBoard.description")}
            action={<CreateColumnDialog boardId={boardId} />}
          />
        )}

        {!isLoading && !isError && columns.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={columnIds}
              strategy={horizontalListSortingStrategy}
            >
              {/* Keep column order LTR for consistent board UX across locales */}
              <div dir="ltr" className="flex h-full flex-row items-start gap-4">
                {columns.map((column) => (
                  <Column
                    key={column.id}
                    column={column}
                    columns={columns}
                    onOpenCard={setOpenCardId}
                    onArchiveCard={(c) =>
                      archiveCard.mutate(
                        { id: c.id, columnId: c.columnId },
                        {
                          onError: () => toast.error(t("failedArchiveCard")),
                          onSuccess: () => toast.success(t("cardArchived")),
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
                          onError: () => toast.error(t("failedRenameList")),
                        },
                      )
                    }
                    onArchiveColumn={(id) =>
                      archiveColumn.mutate(
                        { id, boardId },
                        {
                          onSuccess: () => toast.success(t("listArchived")),
                          onError: () => toast.error(t("failedArchiveList")),
                        },
                      )
                    }
                    onDeleteColumn={(id) =>
                      deleteColumn.mutate(
                        { id, boardId },
                        {
                          onSuccess: () => toast.success(t("listDeleted")),
                          onError: () => toast.error(t("failedDeleteList")),
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
                      moveColumn.mutate({ id, boardId, input });
                    }}
                  />
                ))}
                <CreateColumnDialog boardId={boardId} />
              </div>
            </SortableContext>

            <DragOverlay>
              {activeCard && (
                <div className="w-64 scale-105 rounded-lg border border-primary/30 bg-card p-2.5 text-sm opacity-95 shadow-md">
                  <p className="font-medium">{activeCard.title}</p>
                </div>
              )}
              {activeColumn && (
                <div className="w-72 scale-105 rounded-xl border border-primary/30 bg-muted p-3 opacity-95 shadow-md">
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

      {!hideChrome && (
      <BoardMembersDialog
        boardId={boardId}
        workspaceId={board?.workspaceId}
        open={membersOpen}
        onOpenChange={setMembersOpen}
      />
      )}
    </div>
  );
}
