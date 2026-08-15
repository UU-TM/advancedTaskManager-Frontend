"use client";

import { useState, type DragEvent } from "react";
import {
  MoreHorizontal,
  Calendar,
  GripVertical,
  CheckCircle2,
  MessageSquare,
  Paperclip,
  Plus,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// --- Types & Initial Data ---

export type Priority = "Low" | "Medium" | "High";

export interface Tag {
  label: string;
  dotColor: string;
}

export interface CardData {
  id: string;
  title: string;
  description?: string;
  tags?: Tag[];
  priority?: Priority;
  date?: string;
  avatars?: string[];
  tasksCompleted?: number;
  tasksTotal?: number;
  comments?: number;
  attachments?: number;
  coverImage?: string;
}

export interface ColumnData {
  id: string;
  title: string;
  cards: CardData[];
}

export const INITIAL_BOARD: ColumnData[] = [
  {
    id: "col-1",
    title: "To Do",
    cards: [
      {
        id: "c-1",
        title: "Design System Update",
        description:
          "Audit existing components and create new variants for dark mode.",
        tags: [{ label: "Design", dotColor: "bg-purple-500" }],
        priority: "Medium",
        date: "Oct 15",
        comments: 3,
        attachments: 2,
        avatars: ["https://i.pravatar.cc/150?u=a042581f4e29026024d"],
      },
      {
        id: "c-2",
        title: "Landing Page Hero Iteration",
        coverImage:
          "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
        tags: [{ label: "Marketing", dotColor: "bg-blue-500" }],
        priority: "High",
        comments: 12,
        avatars: [
          "https://i.pravatar.cc/150?u=1",
          "https://i.pravatar.cc/150?u=2",
        ],
      },
    ],
  },
  {
    id: "col-2",
    title: "In Progress",
    cards: [
      {
        id: "c-3",
        title: "Fix Mobile Navigation Bug",
        description:
          "The hamburger menu doesn't close automatically when tapping outside the container.",
        tags: [{ label: "Bug", dotColor: "bg-orange-500" }],
        priority: "High",
        date: "Oct 12",
        tasksCompleted: 2,
        tasksTotal: 5,
        avatars: ["https://i.pravatar.cc/150?u=3"],
      },
    ],
  },
  {
    id: "col-3",
    title: "Done",
    cards: [
      {
        id: "c-4",
        title: "Q3 Financial Report",
        tags: [{ label: "Finance", dotColor: "bg-green-500" }],
        priority: "Low",
        date: "Oct 01",
        attachments: 4,
        avatars: ["https://i.pravatar.cc/150?u=4"],
      },
    ],
  },
];

type KanbanBoardProps = {
  initialBoard?: ColumnData[];
  className?: string;
};

// --- Main Component ---

export function KanbanBoard({
  initialBoard = INITIAL_BOARD,
  className,
}: KanbanBoardProps) {
  const [board, setBoard] = useState<ColumnData[]>(initialBoard);
  const [draggingCard, setDraggingCard] = useState<{
    card: CardData;
    sourceColId: string;
  } | null>(null);

  const handleDragStart = (
    e: DragEvent,
    card: CardData,
    colId: string,
  ) => {
    setDraggingCard({ card, sourceColId: colId });
    e.dataTransfer.effectAllowed = "move";
    const target = e.currentTarget;
    if (target instanceof HTMLElement) {
      requestAnimationFrame(() => target.classList.add("opacity-40"));
    }
  };

  const handleDragEnd = (e: DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.remove("opacity-40");
    }
    setDraggingCard(null);
  };

  const handleDrop = (e: DragEvent, targetColId: string) => {
    e.preventDefault();
    if (!draggingCard) return;
    if (draggingCard.sourceColId === targetColId) return;

    setBoard((prev) => {
      const newBoard = [...prev];
      const sourceColIndex = newBoard.findIndex(
        (c) => c.id === draggingCard.sourceColId,
      );
      const targetColIndex = newBoard.findIndex((c) => c.id === targetColId);

      newBoard[sourceColIndex] = {
        ...newBoard[sourceColIndex],
        cards: newBoard[sourceColIndex].cards.filter(
          (c) => c.id !== draggingCard.card.id,
        ),
      };

      newBoard[targetColIndex] = {
        ...newBoard[targetColIndex],
        cards: [...newBoard[targetColIndex].cards, draggingCard.card],
      };

      return newBoard;
    });
  };

  const handleAddCard = (colId: string, title: string) => {
    const newCard: CardData = {
      id: `c-${Date.now()}`,
      title,
      tags: [{ label: "New", dotColor: "bg-blue-500" }],
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    };

    setBoard((prev) =>
      prev.map((col) => {
        if (col.id === colId) {
          return { ...col, cards: [...col.cards, newCard] };
        }
        return col;
      }),
    );
  };

  const handleDeleteCard = (colId: string, cardId: string) => {
    setBoard((prev) =>
      prev.map((col) => {
        if (col.id === colId) {
          return {
            ...col,
            cards: col.cards.filter((c) => c.id !== cardId),
          };
        }
        return col;
      }),
    );
  };

  return (
    <div
      className={cn(
        "flex w-full min-h-screen overflow-x-auto bg-gray-50 p-8 font-sans transition-colors duration-300 md:p-12 dark:bg-[#111113]",
        className,
      )}
    >
      <div className="mx-auto flex items-start gap-6">
        {board.map((col) => (
          <KanbanColumn
            key={col.id}
            col={col}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
            onAddCard={handleAddCard}
            onDeleteCard={handleDeleteCard}
          />
        ))}
      </div>
    </div>
  );
}

export default KanbanBoard;

// --- Column Component ---

type KanbanColumnProps = {
  col: ColumnData;
  onDragStart: (e: DragEvent, card: CardData, colId: string) => void;
  onDragEnd: (e: DragEvent) => void;
  onDrop: (e: DragEvent, targetColId: string) => void;
  onAddCard: (colId: string, title: string) => void;
  onDeleteCard: (colId: string, cardId: string) => void;
};

function KanbanColumn({
  col,
  onDragStart,
  onDragEnd,
  onDrop,
  onAddCard,
  onDeleteCard,
}: KanbanColumnProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const submitNewCard = () => {
    if (newTaskTitle.trim()) {
      onAddCard(col.id, newTaskTitle);
    }
    setNewTaskTitle("");
    setIsAdding(false);
  };

  return (
    <div
      className="flex w-full min-w-[320px] max-w-[320px] flex-col"
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      }}
      onDrop={(e) => onDrop(e, col.id)}
    >
      <div className="mb-4 flex items-center justify-between px-1">
        <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100">
          {col.title}
          <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-600 dark:bg-[#25262b] dark:text-gray-400">
            {col.cards.length}
          </span>
        </h3>
        <button
          type="button"
          aria-label="Column options"
          className="text-gray-400 transition-colors hover:text-gray-900 dark:hover:text-gray-100"
        >
          <MoreHorizontal size={20} />
        </button>
      </div>

      <div className="flex min-h-[100px] flex-col gap-4 rounded-2xl transition-colors">
        <AnimatePresence>
          {col.cards.map((card) => (
            <motion.div
              key={card.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div
                draggable
                onDragStart={(e) => onDragStart(e, card, col.id)}
                onDragEnd={onDragEnd}
              >
                <KanbanCard
                  card={card}
                  onDelete={() => onDeleteCard(col.id, card.id)}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {col.cards.length === 0 && !isAdding && (
          <div className="flex h-24 items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 text-sm text-gray-400 dark:border-gray-800">
            Drop cards here
          </div>
        )}

        {isAdding ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2"
          >
            <input
              autoFocus
              type="text"
              placeholder="What needs to be done?"
              aria-label="New task title"
              className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-900 shadow-sm outline-none transition-all focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-[#1a1b1e] dark:text-gray-100"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitNewCard();
                if (e.key === "Escape") setIsAdding(false);
              }}
              onBlur={() => {
                if (newTaskTitle.trim()) submitNewCard();
                else setIsAdding(false);
              }}
            />
          </motion.div>
        ) : (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-3 text-sm font-semibold text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700 dark:border-gray-800/60 dark:hover:border-gray-700 dark:hover:text-gray-300"
          >
            <Plus size={16} /> Add Task
          </button>
        )}
      </div>
    </div>
  );
}

// --- Card Component ---

function KanbanCard({
  card,
  onDelete,
}: {
  card: CardData;
  onDelete: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  const getPriorityColor = (p?: Priority) => {
    switch (p) {
      case "High":
        return "text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400";
      case "Medium":
        return "text-orange-600 bg-orange-50 dark:bg-orange-500/10 dark:text-orange-400";
      case "Low":
        return "text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400";
      default:
        return "text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  return (
    <div className="group relative flex w-full cursor-grab flex-col overflow-visible rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 active:cursor-grabbing hover:shadow-md dark:border-gray-800/80 dark:bg-[#1a1b1e]">
      {card.coverImage && (
        <div className="h-32 w-full overflow-hidden rounded-t-2xl border-b border-gray-100 dark:border-gray-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={card.coverImage}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}

      <div className="flex flex-col gap-4 p-5">
        <div className="absolute top-1/2 -left-3 -translate-y-1/2 text-gray-300 opacity-0 transition-opacity group-hover:opacity-100 dark:text-gray-600">
          <GripVertical size={16} aria-hidden />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {card.tags?.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2 py-1 text-[11px] font-semibold tracking-wide text-gray-700 uppercase transition-colors dark:bg-[#25262b] dark:text-gray-300"
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", tag.dotColor)} />
                {tag.label}
              </span>
            ))}
            {card.priority && (
              <span
                className={cn(
                  "rounded-md px-2 py-1 text-[11px] font-bold tracking-wide uppercase",
                  getPriorityColor(card.priority),
                )}
              >
                {card.priority}
              </span>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              aria-label="Card options"
              aria-expanded={showMenu}
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200"
            >
              <MoreHorizontal size={18} />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 z-20 mt-1 w-32 overflow-hidden rounded-lg border border-gray-100 bg-white py-1 shadow-xl dark:border-gray-800 dark:bg-[#25262b]">
                  <button
                    type="button"
                    onClick={() => {
                      onDelete();
                      setShowMenu(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-1 flex flex-col gap-1.5">
          <h4 className="text-[15px] leading-snug font-bold text-gray-900 dark:text-gray-100">
            {card.title}
          </h4>
          {card.description && (
            <p className="line-clamp-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              {card.description}
            </p>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800/60">
          <div className="flex items-center gap-3.5 text-xs font-medium text-gray-500 dark:text-gray-400">
            {card.date && (
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-gray-400" aria-hidden />
                <span>{card.date}</span>
              </div>
            )}

            {card.tasksTotal !== undefined &&
              card.tasksCompleted !== undefined && (
                <div className="flex items-center gap-1.5">
                  <CheckCircle2
                    size={14}
                    className={
                      card.tasksCompleted === card.tasksTotal
                        ? "text-green-500"
                        : "text-gray-400"
                    }
                    aria-hidden
                  />
                  <span>
                    {card.tasksCompleted}/{card.tasksTotal}
                  </span>
                </div>
              )}

            {card.comments !== undefined && card.comments > 0 && (
              <div className="flex cursor-pointer items-center gap-1.5 transition-colors hover:text-gray-700 dark:hover:text-gray-300">
                <MessageSquare
                  size={14}
                  className="text-gray-400"
                  aria-hidden
                />
                <span>{card.comments}</span>
              </div>
            )}

            {card.attachments !== undefined && card.attachments > 0 && (
              <div className="flex items-center gap-1.5">
                <Paperclip size={14} className="text-gray-400" aria-hidden />
                <span>{card.attachments}</span>
              </div>
            )}
          </div>

          {card.avatars && card.avatars.length > 0 && (
            <div className="ml-4 flex shrink-0 items-center -space-x-2">
              {card.avatars.map((url, idx) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={idx}
                  src={url}
                  alt=""
                  className="h-7 w-7 rounded-full border-2 border-white object-cover ring-1 ring-gray-100 dark:border-[#1a1b1e] dark:ring-gray-800"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
