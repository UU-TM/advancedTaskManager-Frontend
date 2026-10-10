"use client";

import { useCallback, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
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
import { Button } from "@/components/ui/button";
import type { Card, BoardColumn } from "@/types/domain";
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
import { ConfirmDelete } from "@/components/ui/confirm-delete";
import { TaskCardBody } from "./TaskCardBody";

type TaskProps = {
  card: Card;
  columns: BoardColumn[];
  onOpen: (cardId: string) => void;
  onArchive: (card: Card) => void;
  onDelete: (card: Card) => void;
  onCopy: (card: Card) => void;
  onMoveTo: (card: Card, columnId: string) => void;
  /** Board pref: show label names on label bars. */
  showLabelText?: boolean;
};

export function Task({
  card,
  columns,
  onOpen,
  onArchive,
  onDelete,
  onCopy,
  onMoveTo,
  showLabelText,
}: TaskProps) {
  const pending = card.id.startsWith("temp-");
  if (pending) {
    return (
      <div className="pointer-events-none relative rounded-lg bg-card text-sm text-card-foreground opacity-60 shadow-[var(--kanban-card-shadow)]">
        <TaskCardBody card={card} showLabelText={showLabelText} />
      </div>
    );
  }

  return (
    <TaskCard
      card={card}
      columns={columns}
      onOpen={onOpen}
      onArchive={onArchive}
      onDelete={onDelete}
      onCopy={onCopy}
      onMoveTo={onMoveTo}
      showLabelText={showLabelText}
    />
  );
}

function TaskCard({
  card,
  columns,
  onOpen,
  onArchive,
  onDelete,
  onCopy,
  onMoveTo,
  showLabelText,
}: TaskProps) {
  const t = useTranslations("kanban");
  const cardElRef = useRef<HTMLDivElement | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: { type: "card", card },
    disabled: isRemoving,
  });

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      cardElRef.current = node;
      setNodeRef(node);
    },
    [setNodeRef],
  );

  const removeWithCrumple = useCallback(
    (action: (c: Card) => void) => {
      if (isRemoving) return;
      const el = cardElRef.current;
      if (!el) {
        action(card);
        return;
      }
      setIsRemoving(true);
      void import("@/lib/crumple-paper")
        .then(({ playCrumplePaper }) =>
          playCrumplePaper(el, { onComplete: () => action(card) }),
        )
        .catch(() => {
          setIsRemoving(false);
          action(card);
        });
    },
    [card, isRemoving],
  );

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const otherColumns = columns.filter((c) => c.id !== card.columnId);

  const menu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="absolute end-1 top-1 rounded-md bg-card/90 opacity-100 shadow-xs sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
          aria-label={t("openCard")}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="size-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onClick={() => onOpen(card.id)}>{t("openCard")}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onCopy(card)}>{t("copyCard")}</DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>{t("moveTo")}</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {otherColumns.map((col) => (
              <DropdownMenuItem key={col.id} onClick={() => onMoveTo(card, col.id)}>
                {col.title}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => removeWithCrumple(onArchive)}>
          {t("archiveCard")}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => setConfirmDelete(true)}
        >
          {t("deleteCard")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={setRefs}
          style={style}
          {...attributes}
          {...listeners}
          role="button"
          tabIndex={0}
          onClick={() => {
            if (isRemoving) return;
            onOpen(card.id);
          }}
          onKeyDown={(e) => {
            listeners?.onKeyDown?.(e);
            if (e.defaultPrevented || isRemoving) return;
            // Space starts a keyboard drag; Enter opens the card.
            if (e.key === "Enter") {
              e.preventDefault();
              onOpen(card.id);
            }
          }}
          className={cn(
            "group relative cursor-pointer rounded-lg bg-card text-sm text-card-foreground shadow-[var(--kanban-card-shadow)] transition-[opacity,box-shadow] duration-150 hover:shadow-[var(--kanban-card-shadow-hover)] active:cursor-grabbing touch-manipulation",
            isDragging && "cursor-grabbing opacity-0",
            isRemoving && "pointer-events-none",
          )}
        >
          <TaskCardBody
            card={card}
            trailing={menu}
            showLabelText={showLabelText}
          />
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={() => onOpen(card.id)}>{t("openCard")}</ContextMenuItem>
        <ContextMenuItem onClick={() => onCopy(card)}>{t("copyCard")}</ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger>{t("moveTo")}</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            {otherColumns.map((col) => (
              <ContextMenuItem
                key={col.id}
                onClick={() => onMoveTo(card, col.id)}
              >
                {col.title}
              </ContextMenuItem>
            ))}
            {otherColumns.length === 0 && (
              <ContextMenuItem disabled>{t("noOtherColumns")}</ContextMenuItem>
            )}
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem
          disabled={isRemoving}
          onClick={() => removeWithCrumple(onArchive)}
        >
          {t("archiveCard")}
        </ContextMenuItem>
        <ContextMenuItem
          disabled={isRemoving}
          className="text-destructive focus:text-destructive"
          onClick={() => setConfirmDelete(true)}
        >
          {t("deleteCard")}
        </ContextMenuItem>
      </ContextMenuContent>
      <ConfirmDelete
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        onConfirm={() => removeWithCrumple(onDelete)}
      />
    </ContextMenu>
  );
}
