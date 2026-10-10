"use client";

import { useRef, useState, type Dispatch, type SetStateAction } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useLocale, useTranslations } from "next-intl";
import { MoreHorizontal, Plus, X } from "lucide-react";
import { toast } from "sonner";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TaskCardBody } from "@/components/features/kanban/TaskCardBody";
import { insertionIndex } from "@/components/features/kanban/card-drag";
import { cn } from "@/lib/utils";
import type { Card, CardPriority } from "@/types/domain";

export type LabelKey = "0" | "1" | "2";
export type MemberKey = "0" | "1";
type TitleKey = "0" | "1" | "2" | "3" | "4" | "5";
type DetailKey = "0" | "1" | "3";

export type DemoColumn = {
  id: string;
  nameKey?: "0" | "1" | "2";
  name?: string;
};

export type DemoCheck = {
  id: string;
  titleKey?: "0" | "1";
  title?: string;
  done: boolean;
};

export type DemoComment = {
  id: string;
  author: MemberKey;
  bodyKey?: "0";
  body?: string;
};

export type DemoCard = {
  id: string;
  titleKey?: TitleKey;
  title?: string;
  descriptionKey?: DetailKey;
  description?: string;
  columnId: string;
  position: number;
  labels: LabelKey[];
  member: MemberKey | null;
  dueDate: string | null;
  priority: CardPriority | null;
  checklist: DemoCheck[];
  comments: DemoComment[];
};

export const DONE_COLUMN_ID = "2";

export const LABEL_COLORS: Record<LabelKey, string> = {
  "0": "#357dff",
  "1": "#0d9488",
  "2": "#ef4444",
};

export const INITIAL_COLUMNS: DemoColumn[] = [
  { id: "0", nameKey: "0" },
  { id: "1", nameKey: "1" },
  { id: "2", nameKey: "2" },
];

export const INITIAL_CARDS: DemoCard[] = [
  {
    id: "c0",
    titleKey: "0",
    descriptionKey: "0",
    columnId: "0",
    position: 0,
    labels: ["0"],
    member: "0",
    dueDate: null,
    priority: null,
    checklist: [
      { id: "k0", titleKey: "0", done: true },
      { id: "k1", titleKey: "1", done: false },
    ],
    comments: [{ id: "m0", author: "1", bodyKey: "0" }],
  },
  {
    id: "c1",
    titleKey: "1",
    descriptionKey: "1",
    columnId: "1",
    position: 0,
    labels: ["1"],
    member: "0",
    dueDate: "2026-10-09T12:00:00.000Z",
    priority: "MEDIUM",
    checklist: [],
    comments: [],
  },
  {
    id: "c2",
    titleKey: "2",
    columnId: "0",
    position: 1,
    labels: ["0"],
    member: null,
    dueDate: null,
    priority: null,
    checklist: [],
    comments: [],
  },
  {
    id: "c3",
    titleKey: "3",
    descriptionKey: "3",
    columnId: "1",
    position: 1,
    labels: ["2"],
    member: "0",
    dueDate: "2026-09-28T12:00:00.000Z",
    priority: "HIGH",
    checklist: [],
    comments: [],
  },
  {
    id: "c4",
    titleKey: "4",
    columnId: "0",
    position: 2,
    labels: [],
    member: null,
    dueDate: "2026-10-22T12:00:00.000Z",
    priority: null,
    checklist: [],
    comments: [],
  },
  {
    id: "c5",
    titleKey: "5",
    columnId: "2",
    position: 0,
    labels: [],
    member: "1",
    dueDate: "2026-10-18T12:00:00.000Z",
    priority: "LOW",
    checklist: [],
    comments: [],
  },
];

export function dueKind(dueDate: string | null, now = Date.now()) {
  if (!dueDate) return "none" as const;
  const time = new Date(dueDate).getTime();
  if (Number.isNaN(time)) return "none" as const;
  if (time < now) return "overdue" as const;
  if (time < now + 2 * 24 * 60 * 60 * 1000) return "soon" as const;
  return "set" as const;
}

export function useDemoBoardCopy() {
  const t = useTranslations("home");
  return {
    titleOf(card: DemoCard) {
      return card.title ?? (card.titleKey ? t(`hero.board.cards.${card.titleKey}`) : "");
    },
    descriptionOf(card: DemoCard) {
      if (card.description != null) return card.description;
      return card.descriptionKey
        ? t(`hero.board.details.desc${card.descriptionKey}`)
        : "";
    },
    columnTitle(column: DemoColumn) {
      return column.name ?? (column.nameKey ? t(`hero.board.columns.${column.nameKey}`) : "");
    },
    labelName(key: LabelKey) {
      return t(`hero.board.labels.${key}`);
    },
    memberName(key: MemberKey) {
      return t(`hero.board.members.${key}`);
    },
    itemTitle(item: DemoCheck) {
      return item.title ?? (item.titleKey ? t(`hero.board.details.check${item.titleKey}`) : "");
    },
    commentBody(comment: DemoComment) {
      return comment.body ?? (comment.bodyKey ? t("hero.board.details.comment") : "");
    },
    checkTitle: t("hero.board.details.checkTitle"),
  };
}

function cardsIn(cards: DemoCard[], columnId: string) {
  return cards
    .filter((card) => card.columnId === columnId)
    .sort((a, b) => a.position - b.position);
}

function relocate(
  cards: DemoCard[],
  cardId: string,
  columnId: string,
  index: number,
) {
  const moving = cards.find((card) => card.id === cardId);
  if (!moving) return cards;
  const target = cardsIn(cards, columnId).filter((card) => card.id !== cardId);
  const at = Math.max(0, Math.min(index, target.length));
  const inserted = [
    ...target.slice(0, at),
    { ...moving, columnId },
    ...target.slice(at),
  ].map((card, position) => ({ ...card, position }));
  return [
    ...cards.filter((card) => card.id !== cardId && card.columnId !== columnId),
    ...inserted,
  ];
}

function toFace(
  card: DemoCard,
  copy: ReturnType<typeof useDemoBoardCopy>,
): Card {
  const member = card.member
    ? { id: card.member, username: copy.memberName(card.member) }
    : null;
  return {
    id: card.id,
    columnId: card.columnId,
    title: copy.titleOf(card),
    description: copy.descriptionOf(card) || null,
    position: card.position,
    priority: card.priority,
    assignees: member ? [member] : [],
    labels: card.labels.map((key) => ({
      id: key,
      boardId: "demo",
      name: copy.labelName(key),
      color: LABEL_COLORS[key],
    })),
    dueDate: card.dueDate,
    createdAt: "2026-10-01T12:00:00.000Z",
    _count: {
      comments: card.comments.length,
      attachments: 0,
      checklists: card.checklist.length > 0 ? 1 : 0,
    },
  };
}

export function LandingKanban({
  columns,
  cards,
  setColumns,
  setCards,
}: {
  columns: DemoColumn[];
  cards: DemoCard[];
  setColumns: Dispatch<SetStateAction<DemoColumn[]>>;
  setCards: Dispatch<SetStateAction<DemoCard[]>>;
}) {
  const kanban = useTranslations("kanban");
  const common = useTranslations("common");
  const copy = useDemoBoardCopy();
  const locale = useLocale();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const [addingColumn, setAddingColumn] = useState(false);
  const [columnDraft, setColumnDraft] = useState("");
  const cardsRef = useRef(cards);
  const columnsRef = useRef(columns);
  const snapshot = useRef<DemoCard[] | null>(null);
  cardsRef.current = cards;
  columnsRef.current = columns;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const activeCard = cards.find((card) => card.id === activeId) ?? null;
  const activeColumn = columns.find((column) => column.id === activeColumnId) ?? null;

  function targetColumn(over: DragOverEvent["over"]) {
    if (!over) return null;
    const overType = over.data.current?.type as string | undefined;
    if (overType === "column-drop") return over.data.current?.columnId as string;
    if (overType === "column") return String(over.id);
    if (overType === "card") return (over.data.current?.card as DemoCard).columnId;
    if (String(over.id).startsWith("droppable-")) {
      return String(over.id).slice("droppable-".length);
    }
    return null;
  }

  function onDragStart(event: DragStartEvent) {
    const type = event.active.data.current?.type as string | undefined;
    if (type === "card") {
      snapshot.current = cardsRef.current;
      setActiveId(String(event.active.id));
    } else if (type === "column") {
      setActiveColumnId(String(event.active.id));
    }
  }

  function onDragOver(event: DragOverEvent) {
    if (event.active.data.current?.type !== "card" || !event.over) return;
    const columnId = targetColumn(event.over);
    if (!columnId) return;
    const overType = event.over.data.current?.type as string | undefined;
    const overCardId =
      overType === "card" && String(event.over.id) !== String(event.active.id)
        ? String(event.over.id)
        : null;
    const translatedTop = event.active.rect.current.translated?.top;
    const mid = event.over.rect.top + event.over.rect.height / 2;
    const placeAfter = translatedTop != null && translatedTop > mid;
    setCards((current) => {
      const without = cardsIn(current, columnId).filter(
        (card) => card.id !== String(event.active.id),
      );
      const insertAt = insertionIndex(without as Card[], String(event.active.id), overCardId, placeAfter);
      const existing = cardsIn(current, columnId);
      const currentIndex = existing.findIndex((card) => card.id === String(event.active.id));
      if (currentIndex === insertAt) return current;
      return relocate(current, String(event.active.id), columnId, insertAt);
    });
  }

  function onDragEnd(event: DragEndEvent) {
    const type = event.active.data.current?.type as string | undefined;
    if (type === "column") {
      setActiveColumnId(null);
      const overId = event.over ? targetColumn(event.over) ?? String(event.over.id) : null;
      if (!overId || overId === String(event.active.id)) return;
      setColumns((current) => {
        const from = current.findIndex((column) => column.id === event.active.id);
        const to = current.findIndex((column) => column.id === overId);
        if (from < 0 || to < 0 || from === to) return current;
        return arrayMove(current, from, to);
      });
      return;
    }
    if (type === "card" && !event.over && snapshot.current) {
      setCards(snapshot.current);
    }
    snapshot.current = null;
    setActiveId(null);
  }

  function onDragCancel() {
    if (snapshot.current) setCards(snapshot.current);
    snapshot.current = null;
    setActiveId(null);
    setActiveColumnId(null);
  }

  function removeCard(card: DemoCard, message: "cardArchived" | "cardDeleted") {
    setCards((current) => current.filter((item) => item.id !== card.id));
    toast.success(kanban(message), {
      action: {
        label: common("undo"),
        onClick: () =>
          setCards((current) =>
            current.some((item) => item.id === card.id) ? current : [...current, card],
          ),
      },
    });
  }

  function copyCard(card: DemoCard) {
    const stamp = Date.now();
    setCards((current) => {
      const list = cardsIn(current, card.columnId);
      return [
        ...current,
        {
          ...card,
          id: `${card.id}-copy-${stamp}`,
          title: `${copy.titleOf(card)}${kanban("listCopySuffix")}`,
          titleKey: undefined,
          position: list.length,
          checklist: card.checklist.map((item, index) => ({
            ...item,
            id: `${item.id}-${stamp}-${index}`,
          })),
          comments: card.comments.map((item, index) => ({
            ...item,
            id: `${item.id}-${stamp}-${index}`,
          })),
        },
      ];
    });
    toast.success(kanban("cardCopied"));
  }

  function moveCardTo(card: DemoCard, columnId: string) {
    setCards((current) =>
      relocate(current, card.id, columnId, cardsIn(current, columnId).length),
    );
  }

  function sortColumn(columnId: string, mode: "title" | "due") {
    setCards((current) => {
      const sorted = [...cardsIn(current, columnId)].sort((a, b) => {
        if (mode === "title") {
          return copy.titleOf(a).localeCompare(copy.titleOf(b), locale, {
            sensitivity: "base",
          });
        }
        const ad = a.dueDate ? new Date(a.dueDate).getTime() : Number.POSITIVE_INFINITY;
        const bd = b.dueDate ? new Date(b.dueDate).getTime() : Number.POSITIVE_INFINITY;
        return ad - bd;
      });
      const order = new Map(sorted.map((card, position) => [card.id, position]));
      return current.map((card) =>
        order.has(card.id) ? { ...card, position: order.get(card.id)! } : card,
      );
    });
  }

  function copyColumn(column: DemoColumn) {
    const stamp = Date.now();
    const id = `col-${stamp}`;
    setColumns((current) => {
      const index = current.findIndex((item) => item.id === column.id);
      const next = [...current];
      next.splice(index + 1, 0, {
        id,
        name: `${copy.columnTitle(column)}${kanban("listCopySuffix")}`,
      });
      return next;
    });
    setCards((current) => [
      ...current,
      ...cardsIn(current, column.id).map((card, position) => ({
        ...card,
        id: `${card.id}-list-${stamp}-${position}`,
        columnId: id,
        position,
        checklist: card.checklist.map((item, index) => ({
          ...item,
          id: `${item.id}-list-${stamp}-${index}`,
        })),
        comments: card.comments.map((item, index) => ({
          ...item,
          id: `${item.id}-list-${stamp}-${index}`,
        })),
      })),
    ]);
  }

  function removeColumn(column: DemoColumn, message: "columnArchived" | "columnDeleted") {
    const removed = cardsIn(cards, column.id);
    setColumns((current) => current.filter((item) => item.id !== column.id));
    setCards((current) => current.filter((card) => card.columnId !== column.id));
    toast.success(kanban(message), {
      action: {
        label: common("undo"),
        onClick: () => {
          setColumns((current) =>
            current.some((item) => item.id === column.id) ? current : [...current, column],
          );
          setCards((current) => {
            const missing = removed.filter(
              (card) => !current.some((item) => item.id === card.id),
            );
            return [...current, ...missing];
          });
        },
      },
    });
  }

  function addColumn() {
    const name = columnDraft.trim();
    if (!name) return;
    setColumns((current) => [...current, { id: `col-${Date.now()}`, name }]);
    setColumnDraft("");
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      <div
        dir="ltr"
        className="landing-board min-h-[460px] overflow-x-auto bg-[linear-gradient(135deg,#d3e4e6_0%,#9fcfc8_55%,#5fa8a0_100%)] p-3 md:p-4 dark:bg-[linear-gradient(160deg,#1c2f2a_0%,#0f3d38_55%,#115e59_100%)]"
      >
        <SortableContext items={columns.map((column) => column.id)} strategy={horizontalListSortingStrategy}>
          <div className="flex w-max items-start gap-3">
            {columns.map((column, index) => (
              <DemoColumn
                key={column.id}
                column={column}
                columns={columns}
                cards={cardsIn(cards, column.id)}
                isFirst={index === 0}
                isLast={index === columns.length - 1}
                title={copy.columnTitle(column)}
                onRename={(name) =>
                  setColumns((current) =>
                    current.map((item) =>
                      item.id === column.id ? { ...item, name, nameKey: undefined } : item,
                    ),
                  )
                }
                onMove={(direction) =>
                  setColumns((current) => {
                    const from = current.findIndex((item) => item.id === column.id);
                    const to = from + direction;
                    if (from < 0 || to < 0 || to >= current.length) return current;
                    return arrayMove(current, from, to);
                  })
                }
                onCopyList={() => copyColumn(column)}
                onSort={(mode) => sortColumn(column.id, mode)}
                onArchiveAll={() =>
                  setCards((current) => current.filter((card) => card.columnId !== column.id))
                }
                onArchive={() => removeColumn(column, "columnArchived")}
                onDelete={() => removeColumn(column, "columnDeleted")}
                onCopyCard={copyCard}
                onArchiveCard={(card) => removeCard(card, "cardArchived")}
                onDeleteCard={(card) => removeCard(card, "cardDeleted")}
                onMoveCard={moveCardTo}
                onAddCard={(title) =>
                  setCards((current) => [
                    ...current,
                    {
                      id: `c${Date.now()}`,
                      title,
                      columnId: column.id,
                      position: cardsIn(current, column.id).length,
                      labels: [],
                      member: null,
                      dueDate: null,
                      priority: null,
                      checklist: [],
                      comments: [],
                    },
                  ])
                }
                faceOf={(card) => toFace(card, copy)}
              />
            ))}
            {addingColumn ? (
              <form
                className="w-[272px] shrink-0 rounded-2xl bg-[var(--kanban-list-bg)] p-2 text-foreground shadow-[var(--kanban-list-shadow)]"
                onSubmit={(event) => {
                  event.preventDefault();
                  addColumn();
                }}
              >
                <Input
                  autoFocus
                  value={columnDraft}
                  placeholder={kanban("columnNamePlaceholder")}
                  aria-label={kanban("addColumn")}
                  onChange={(event) => setColumnDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      setColumnDraft("");
                      setAddingColumn(false);
                    }
                  }}
                  className="h-8 border-transparent bg-card text-sm shadow-[var(--kanban-card-shadow)]"
                />
                <div className="mt-2 flex items-center gap-1">
                  <Button type="submit" size="sm">
                    {common("add")}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={common("cancel")}
                    onClick={() => {
                      setColumnDraft("");
                      setAddingColumn(false);
                    }}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </form>
            ) : (
              <Button
                type="button"
                variant="ghost"
                className="h-auto w-[272px] shrink-0 justify-start rounded-2xl bg-[var(--kanban-list-bg)] px-3 py-3 font-medium text-foreground shadow-[var(--kanban-list-shadow)] hover:bg-[color-mix(in_oklab,var(--kanban-list-bg)_88%,var(--foreground))]"
                onClick={() => setAddingColumn(true)}
              >
                <Plus className="size-4" />
                {kanban("addColumn")}
              </Button>
            )}
          </div>
        </SortableContext>
      </div>
      <DragOverlay>
        {activeCard ? (
          <div className="landing-board relative w-[256px] rotate-2 cursor-grabbing rounded-lg bg-card text-sm text-card-foreground opacity-95 shadow-[var(--kanban-card-shadow-hover)]">
            <TaskCardBody card={toFace(activeCard, copy)} />
          </div>
        ) : null}
        {activeColumn ? (
          <div className="landing-board w-[272px] rounded-2xl bg-[var(--kanban-list-bg)] p-3 text-foreground opacity-95 shadow-[var(--kanban-list-shadow)]">
            <p className="text-sm font-semibold">{copy.columnTitle(activeColumn)}</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function DemoColumn({
  column,
  columns,
  cards,
  isFirst,
  isLast,
  title,
  onRename,
  onMove,
  onCopyList,
  onSort,
  onArchiveAll,
  onArchive,
  onDelete,
  onCopyCard,
  onArchiveCard,
  onDeleteCard,
  onMoveCard,
  onAddCard,
  faceOf,
}: {
  column: DemoColumn;
  columns: DemoColumn[];
  cards: DemoCard[];
  isFirst: boolean;
  isLast: boolean;
  title: string;
  onRename: (name: string) => void;
  onMove: (direction: -1 | 1) => void;
  onCopyList: () => void;
  onSort: (mode: "title" | "due") => void;
  onArchiveAll: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onCopyCard: (card: DemoCard) => void;
  onArchiveCard: (card: DemoCard) => void;
  onDeleteCard: (card: DemoCard) => void;
  onMoveCard: (card: DemoCard, columnId: string) => void;
  onAddCard: (title: string) => void;
  faceOf: (card: DemoCard) => Card;
}) {
  const kanban = useTranslations("kanban");
  const common = useTranslations("common");
  const copy = useDemoBoardCopy();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);
  const [composer, setComposer] = useState(false);
  const [taskDraft, setTaskDraft] = useState("");
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id, data: { type: "column", column } });
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `droppable-${column.id}`,
    data: { type: "column-drop", columnId: column.id },
  });

  function commitRename() {
    setEditing(false);
    const next = draft.trim();
    if (next && next !== title) onRename(next);
    else setDraft(title);
  }

  function submitTask() {
    const next = taskDraft.trim();
    if (!next) return;
    onAddCard(next);
    setTaskDraft("");
  }

  return (
    <div
      ref={(node) => {
        setSortableRef(node);
        setDroppableRef(node);
      }}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      dir="auto"
      className={cn(
        "flex max-h-[420px] w-[272px] shrink-0 flex-col rounded-2xl bg-[var(--kanban-list-bg)] pb-1 text-foreground shadow-[var(--kanban-list-shadow)]",
        isDragging && "opacity-50",
        isOver && "bg-[color-mix(in_oklab,var(--kanban-list-bg)_88%,var(--primary))]",
      )}
    >
      <div
        className="flex cursor-grab items-start gap-1 rounded-t-2xl px-2 pt-2 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        {editing ? (
          <Input
            value={draft}
            autoFocus
            onChange={(event) => setDraft(event.target.value)}
            onBlur={commitRename}
            onFocus={(event) => event.currentTarget.select()}
            onPointerDown={(event) => event.stopPropagation()}
            onKeyDown={(event) => {
              event.stopPropagation();
              if (event.key === "Enter") commitRename();
              if (event.key === "Escape") {
                setDraft(title);
                setEditing(false);
              }
            }}
            className="h-8 flex-1 border-transparent bg-card text-sm font-semibold shadow-[var(--kanban-card-shadow)]"
          />
        ) : (
          <button
            type="button"
            className="min-h-8 flex-1 truncate rounded-md px-2 py-1.5 text-start text-sm font-semibold leading-5"
            onClick={(event) => {
              event.stopPropagation();
              setDraft(title);
              setEditing(true);
            }}
            onPointerDown={(event) => event.stopPropagation()}
          >
            {title}
            <span className="ms-2 text-xs font-normal text-muted-foreground">{cards.length}</span>
          </button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="mt-0.5 shrink-0 text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
              aria-label={kanban("columnActions")}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="landing-board">
            <DropdownMenuItem
              onClick={() => {
                setDraft(title);
                setEditing(true);
              }}
            >
              {kanban("rename")}
            </DropdownMenuItem>
            <DropdownMenuItem disabled={isFirst} onClick={() => onMove(-1)}>
              {kanban("moveLeft")}
            </DropdownMenuItem>
            <DropdownMenuItem disabled={isLast} onClick={() => onMove(1)}>
              {kanban("moveRight")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onCopyList}>{kanban("copyList")}</DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger disabled={cards.length < 2}>
                {kanban("sortCards")}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="landing-board">
                <DropdownMenuItem onClick={() => onSort("title")}>
                  {kanban("sortByTitle")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSort("due")}>
                  {kanban("sortByDue")}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem disabled={cards.length === 0} onClick={onArchiveAll}>
              {kanban("archiveAllCards")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onArchive}>{kanban("archiveColumn")}</DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={onDelete}
            >
              {kanban("deleteColumn")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex min-h-8 flex-1 flex-col gap-2 overflow-y-auto px-2 pb-1 pt-1">
        <SortableContext items={cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <DemoCardView
              key={card.id}
              card={card}
              face={faceOf(card)}
              columns={columns}
              columnTitle={copy.columnTitle}
              onCopy={onCopyCard}
              onArchive={onArchiveCard}
              onDelete={onDeleteCard}
              onMove={onMoveCard}
            />
          ))}
        </SortableContext>
      </div>
      <div className="shrink-0 px-2 pb-1">
        {composer ? (
          <div className="space-y-2">
            <Textarea
              autoFocus
              value={taskDraft}
              rows={2}
              placeholder={kanban("taskTitlePlaceholder")}
              aria-label={kanban("addTask")}
              className="min-h-14 resize-none rounded-lg border-0 bg-card text-sm shadow-[var(--kanban-card-shadow)] focus-visible:ring-1"
              onChange={(event) => setTaskDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  submitTask();
                }
                if (event.key === "Escape") {
                  setTaskDraft("");
                  setComposer(false);
                }
              }}
            />
            <div className="flex items-center gap-1">
              <Button type="button" size="sm" onClick={submitTask}>
                {common("add")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={common("cancel")}
                onClick={() => {
                  setTaskDraft("");
                  setComposer(false);
                }}
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-full justify-start rounded-lg px-2 font-normal text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
            onClick={() => setComposer(true)}
          >
            <Plus className="size-4" />
            {kanban("addTask")}
          </Button>
        )}
      </div>
    </div>
  );
}

function DemoCardView({
  card,
  face,
  columns,
  columnTitle,
  onCopy,
  onArchive,
  onDelete,
  onMove,
}: {
  card: DemoCard;
  face: Card;
  columns: DemoColumn[];
  columnTitle: (column: DemoColumn) => string;
  onCopy: (card: DemoCard) => void;
  onArchive: (card: DemoCard) => void;
  onDelete: (card: DemoCard) => void;
  onMove: (card: DemoCard, columnId: string) => void;
}) {
  const kanban = useTranslations("kanban");
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: "card", card },
  });
  const others = columns.filter((column) => column.id !== card.columnId);
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={cn(
        "group relative cursor-grab rounded-lg bg-card text-sm text-card-foreground shadow-[var(--kanban-card-shadow)] transition-[opacity,box-shadow] duration-150 hover:shadow-[var(--kanban-card-shadow-hover)] active:cursor-grabbing",
        isDragging && "cursor-grabbing opacity-0",
      )}
    >
      <TaskCardBody
        card={face}
        trailing={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="absolute end-1 top-1 rounded-md bg-card/90 opacity-100 shadow-xs sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
                aria-label={face.title}
                onClick={(event) => event.stopPropagation()}
                onPointerDown={(event) => event.stopPropagation()}
              >
                <MoreHorizontal className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="landing-board w-48"
              onClick={(event) => event.stopPropagation()}
            >
              <DropdownMenuItem onClick={() => onCopy(card)}>{kanban("copyCard")}</DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>{kanban("moveTo")}</DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="landing-board">
                  {others.map((column) => (
                    <DropdownMenuItem key={column.id} onClick={() => onMove(card, column.id)}>
                      {columnTitle(column)}
                    </DropdownMenuItem>
                  ))}
                  {others.length === 0 && (
                    <DropdownMenuItem disabled>{kanban("noOtherColumns")}</DropdownMenuItem>
                  )}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onArchive(card)}>{kanban("archiveCard")}</DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(card)}
              >
                {kanban("deleteCard")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />
    </div>
  );
}
