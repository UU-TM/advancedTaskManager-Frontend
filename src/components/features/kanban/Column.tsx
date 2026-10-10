"use client";

import { useRef, useState } from "react";
import { ConfirmDelete } from "@/components/ui/confirm-delete";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  useArchiveCard,
  useCards,
  useCopyCard,
  useMoveCard,
  useUnarchiveCard,
} from "@/hooks/use-card";
import { useCreateColumn } from "@/hooks/use-columns";
import { Task } from "./Task";
import { InlineCardComposer } from "./InlineCardComposer";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { BoardColumn, Card } from "@/types/domain";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

type ColumnProps = {
  column: BoardColumn;
  columns: BoardColumn[];
  dragOver?: boolean;
  onOpenCard: (cardId: string) => void;
  onArchiveCard: (card: Card) => void;
  onDeleteCard: (card: Card) => void;
  onCopyCard: (card: Card) => void;
  onMoveCardTo: (card: Card, columnId: string) => void;
  onRename: (columnId: string, title: string) => void;
  onArchiveColumn: (columnId: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onMoveColumn: (columnId: string, direction: "left" | "right") => void;
  /** Board pref: show label names on label bars. */
  showLabelText?: boolean;
};

type SortMode = "title" | "due";

export function Column({
  column,
  columns,
  dragOver = false,
  onOpenCard,
  onArchiveCard,
  onDeleteCard,
  onCopyCard,
  onMoveCardTo,
  onRename,
  onArchiveColumn,
  onDeleteColumn,
  onMoveColumn,
  showLabelText,
}: ColumnProps) {
  const t = useTranslations("kanban");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const moveCard = useMoveCard();
  const archiveCard = useArchiveCard();
  const unarchiveCard = useUnarchiveCard();
  const copyCard = useCopyCard();
  const createColumn = useCreateColumn();
  const [listBusy, setListBusy] = useState(false);
  const pending = column.id.startsWith("temp-");
  // Filtered boards pass `column.cards`. Unfiltered boards omit it so drag
  // optimism stays on the per-column query.
  const embedded = column.cards;
  const { data: fetchedCards = [], isLoading: fetchingCards } = useCards(
    embedded || pending ? undefined : column.id,
  );
  const cards = embedded ?? (pending ? [] : fetchedCards);
  const isLoading = embedded || pending ? false : fetchingCards;
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(column.title);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const columnIndex = columns.findIndex((c) => c.id === column.id);
  const isFirst = columnIndex <= 0;
  const isLast = columnIndex === columns.length - 1;

  function startRename() {
    setTitle(column.title);
    setEditing(true);
  }

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: { type: "column", column },
    disabled: pending,
  });

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `droppable-${column.id}`,
    data: { type: "column-drop", columnId: column.id },
  });

  const setRef = (node: HTMLElement | null) => {
    setSortableRef(node);
    setDroppableRef(node);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const cardIds = cards.map((c) => c.id);

  async function sortCards(mode: SortMode) {
    if (listBusy || cards.length < 2) return;
    const sorted = [...cards].sort((a, b) => {
      if (mode === "title") {
        return a.title.localeCompare(b.title, locale, { sensitivity: "base" });
      }
      const ad = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const bd = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      if (ad === bd) return 0;
      return ad < bd ? -1 : 1;
    });
    // Move only what is out of place, simulating the server-side order.
    const order = cards.map((c) => c.id);
    setListBusy(true);
    try {
      for (let i = 0; i < sorted.length; i++) {
        const id = sorted[i].id;
        if (order[i] === id) continue;
        const input =
          i === 0
            ? { columnId: column.id, beforeCardId: order[0] }
            : { columnId: column.id, afterCardId: sorted[i - 1].id };
        await moveCard.mutateAsync({
          id,
          sourceColumnId: column.id,
          input,
        });
        order.splice(order.indexOf(id), 1);
        order.splice(i, 0, id);
      }
      toast.success(t("listSorted"));
    } catch {
      toast.error(t("failedSortList"));
    } finally {
      setListBusy(false);
    }
  }

  async function archiveAllCards() {
    if (listBusy || cards.length === 0) return;
    const targets = [...cards];
    setListBusy(true);
    try {
      for (const c of targets) {
        await archiveCard.mutateAsync({ id: c.id, columnId: column.id });
      }
      toast.success(t("allCardsArchived", { count: targets.length }), {
        action: {
          label: tCommon("undo"),
          onClick: () => {
            void Promise.all(
              targets.map((c) =>
                unarchiveCard.mutateAsync({ id: c.id, columnId: column.id }),
              ),
            ).catch(() => toast.error(t("failedArchiveCard")));
          },
        },
      });
    } catch {
      toast.error(t("failedArchiveCard"));
    } finally {
      setListBusy(false);
    }
  }

  async function copyList() {
    if (listBusy || pending) return;
    setListBusy(true);
    try {
      const suffix = t("listCopySuffix");
      const name = `${column.title.slice(0, Math.max(1, 40 - suffix.length))}${suffix}`;
      const created = await createColumn.mutateAsync({
        boardId: column.boardId,
        name,
      });
      for (const c of cards) {
        await copyCard.mutateAsync({
          id: c.id,
          input: {
            columnId: created.id,
            includeChecklists: true,
            includeLabels: true,
          },
        });
      }
      toast.success(t("listCopied"));
    } catch {
      toast.error(t("failedCopyList"));
    } finally {
      setListBusy(false);
    }
  }

  function commitRename() {
    setEditing(false);
    const next = title.trim();
    if (next && next !== column.title) {
      onRename(column.id, next);
    } else {
      setTitle(column.title);
    }
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={setRef}
          style={style}
          data-column-id={column.id}
          dir="auto"
          className={cn(
            "flex w-[272px] shrink-0 flex-col rounded-2xl pb-1 max-h-[calc(100dvh-11rem)]",
            "bg-[var(--kanban-list-bg)] text-foreground shadow-[var(--kanban-list-shadow)]",
            "transition-[box-shadow,opacity,background-color] duration-150",
            pending && "opacity-70",
            isDragging && "opacity-50",
            (isOver || dragOver) &&
              "bg-[color-mix(in_oklab,var(--kanban-list-bg)_88%,var(--primary))]",
          )}
        >
          {/* Header doubles as list drag handle (Trello-style) */}
          <div
            className={cn(
              "flex items-start gap-1 rounded-t-2xl px-2 pt-2",
              !pending && "cursor-grab active:cursor-grabbing touch-manipulation",
            )}
            {...attributes}
            {...listeners}
          >
            {editing ? (
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={commitRename}
                onFocus={(e) => e.currentTarget.select()}
                onPointerDown={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === "Enter") commitRename();
                  if (e.key === "Escape") {
                    setTitle(column.title);
                    setEditing(false);
                  }
                }}
                className="h-8 flex-1 border-transparent bg-card text-sm font-semibold shadow-[var(--kanban-card-shadow)]"
                autoFocus
              />
            ) : (
              <button
                type="button"
                className="min-h-8 flex-1 truncate rounded-md px-2 py-1.5 text-start text-sm font-semibold leading-5 text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  startRename();
                }}
                onPointerDown={(e) => e.stopPropagation()}
              >
                {column.title}
                <span className="ms-2 text-xs font-normal text-muted-foreground">
                  {cards.length}
                </span>
              </button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="mt-0.5 shrink-0 text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                  aria-label={t("columnActions")}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={startRename}>{t("rename")}</DropdownMenuItem>
                <DropdownMenuItem
                  disabled={isFirst}
                  onClick={() => onMoveColumn(column.id, "left")}
                >
                  {t("moveLeft")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={isLast}
                  onClick={() => onMoveColumn(column.id, "right")}
                >
                  {t("moveRight")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled={pending || listBusy} onClick={() => void copyList()}>
                  {t("copyList")}
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger disabled={pending || listBusy || cards.length < 2}>
                    {t("sortCards")}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => void sortCards("title")}>
                      {t("sortByTitle")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => void sortCards("due")}>
                      {t("sortByDue")}
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuItem
                  disabled={pending || listBusy || cards.length === 0}
                  onClick={() => void archiveAllCards()}
                >
                  {t("archiveAllCards")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onArchiveColumn(column.id)}>
                  {t("archiveColumn")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setConfirmDelete(true)}
                >
                  {t("deleteColumn")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div
            ref={listRef}
            className="flex min-h-2 flex-1 flex-col gap-2 overflow-y-auto px-2 pb-1 pt-1"
          >
            {isLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-14 w-full rounded-lg shadow-[var(--kanban-card-shadow)]"
                />
              ))}
            <SortableContext
              items={cardIds}
              strategy={verticalListSortingStrategy}
            >
              {cards.map((card) => (
                <Task
                  key={card.id}
                  card={card}
                  columns={columns}
                  onOpen={onOpenCard}
                  onArchive={onArchiveCard}
                  onDelete={onDeleteCard}
                  onCopy={onCopyCard}
                  onMoveTo={onMoveCardTo}
                  showLabelText={showLabelText}
                />
              ))}
            </SortableContext>
            {!isLoading && cards.length === 0 && (
              <div className="min-h-8 flex-1" aria-hidden />
            )}
          </div>
          {!pending && (
            <div className="shrink-0 px-2 pb-1">
              <InlineCardComposer
                boardId={column.boardId}
                columnId={column.id}
                onCreated={() => {
                  const list = listRef.current;
                  if (list) list.scrollTop = list.scrollHeight;
                }}
              />
            </div>
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={startRename}>{t("rename")}</ContextMenuItem>
        <ContextMenuItem
          disabled={isFirst}
          onClick={() => onMoveColumn(column.id, "left")}
        >
          {t("moveLeft")}
        </ContextMenuItem>
        <ContextMenuItem
          disabled={isLast}
          onClick={() => onMoveColumn(column.id, "right")}
        >
          {t("moveRight")}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem disabled={pending || listBusy} onClick={() => void copyList()}>
          {t("copyList")}
        </ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger disabled={pending || listBusy || cards.length < 2}>
            {t("sortCards")}
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem onClick={() => void sortCards("title")}>
              {t("sortByTitle")}
            </ContextMenuItem>
            <ContextMenuItem onClick={() => void sortCards("due")}>
              {t("sortByDue")}
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuItem
          disabled={pending || listBusy || cards.length === 0}
          onClick={() => void archiveAllCards()}
        >
          {t("archiveAllCards")}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => onArchiveColumn(column.id)}>
          {t("archiveColumn")}
        </ContextMenuItem>
        <ContextMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => setConfirmDelete(true)}
        >
          {t("deleteColumn")}
        </ContextMenuItem>
      </ContextMenuContent>
      <ConfirmDelete
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={t("deleteColumnTitle")}
        description={t("deleteColumnDescription")}
        onConfirm={() => onDeleteColumn(column.id)}
      />
    </ContextMenu>
  );
}
