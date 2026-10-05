"use client";

import { useRef, useState } from "react";
import { ConfirmDelete } from "@/components/ui/confirm-delete";
import { useTranslations } from "next-intl";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { useCards } from "@/hooks/use-card";
import { Task } from "./Task";
import { InlineCardComposer } from "./InlineCardComposer";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
};

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
}: ColumnProps) {
  const t = useTranslations("kanban");
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
            "flex w-72 shrink-0 flex-col rounded-xl border border-border bg-muted/50 max-h-[calc(100dvh-9rem)] transition-[box-shadow,border-color,opacity] duration-150",
            pending && "opacity-70",
            isDragging && "opacity-50 shadow-lg scale-[1.01]",
            (isOver || dragOver) &&
              "ring-2 ring-primary/40 border-primary/30 bg-primary/5",
          )}
        >
          <div className="flex items-center gap-1 border-b border-border/80 px-2 py-2.5">
            <button
              type="button"
              className="cursor-grab touch-manipulation rounded-md p-1 text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground disabled:cursor-default disabled:opacity-40"
              {...attributes}
              {...listeners}
              disabled={pending}
              aria-label={t("dragColumn")}
            >
              <GripVertical className="size-4" />
            </button>
            {editing ? (
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={commitRename}
                onFocus={(e) => e.currentTarget.select()}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitRename();
                  if (e.key === "Escape") {
                    setTitle(column.title);
                    setEditing(false);
                  }
                }}
                className="h-7 text-sm font-semibold"
                autoFocus
              />
            ) : (
              <button
                type="button"
                className="flex-1 truncate text-start text-sm font-semibold"
                onClick={startRename}
              >
                {column.title}
                <span className="ms-2 text-xs font-normal text-muted-foreground">
                  {cards.length}
                </span>
              </button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="icon-xs" aria-label={t("columnActions")}>
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

          <div ref={listRef} className="flex min-h-16 flex-1 flex-col gap-2 overflow-y-auto p-2.5">
            {isLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
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
                />
              ))}
            </SortableContext>
            {!isLoading && cards.length === 0 && (
              <div className="min-h-16 flex-1" aria-hidden />
            )}
          </div>
          {!pending && (
            <div className="shrink-0 border-t border-border/60 p-2">
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
