"use client";

import { useState } from "react";
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
import { CreateTaskDialog } from "./CreateTaskDialog";
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
  const { data: cards = [], isLoading } = useCards(column.id);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(column.title);

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
          className={cn(
            "flex w-72 shrink-0 flex-col rounded-xl border border-border bg-muted/50 max-h-[calc(100dvh-9rem)] transition-[box-shadow,border-color,opacity] duration-150",
            isDragging && "opacity-50 shadow-lg scale-[1.01]",
            isOver && "ring-2 ring-primary/40 border-primary/30 bg-primary/5",
          )}
        >
          <div className="flex items-center gap-1 border-b border-border/80 px-2 py-2.5">
            <button
              type="button"
              className="cursor-grab touch-manipulation rounded-md p-1 text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
              {...attributes}
              {...listeners}
              aria-label={t("dragColumn")}
            >
              <GripVertical className="size-4" />
            </button>
            {editing ? (
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={commitRename}
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
              <h2
                className="flex-1 truncate text-sm font-semibold cursor-text"
                onDoubleClick={() => setEditing(true)}
              >
                {column.title}
                <span className="ms-2 text-xs font-normal text-muted-foreground">
                  {cards.length}
                </span>
              </h2>
            )}
          </div>

          <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2.5">
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
            <CreateTaskDialog boardId={column.boardId} columnId={column.id} />
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={() => setEditing(true)}>{t("rename")}</ContextMenuItem>
        <ContextMenuItem onClick={() => onMoveColumn(column.id, "left")}>
          {t("moveLeft")}
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onMoveColumn(column.id, "right")}>
          {t("moveRight")}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => onArchiveColumn(column.id)}>
          {t("archiveList")}
        </ContextMenuItem>
        <ContextMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => onDeleteColumn(column.id)}
        >
          {t("deleteList")}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
