"use client";

import { useCards } from "@/hooks/use-card";
import { Task } from "./Task";
import { CreateTaskDialog } from "./CreateTaskDialog";
import type { BoardColumn } from "@/types/domain";

type ColumnProps = {
  column: BoardColumn;
};

export function Column({ column }: ColumnProps) {
  const { data: cards, isLoading } = useCards(column.id);

  return (
    <div className="w-64 shrink-0 rounded-lg border bg-muted/40 p-3">
      <h2 className="text-sm font-semibold mb-2">{column.title}</h2>
      <div className="flex flex-col gap-2">
        {isLoading && <p className="text-xs text-muted-foreground">Loading...</p>}
        {cards?.map((card) => (
          <Task key={card.id} card={card} />
        ))}
        <CreateTaskDialog boardId={column.boardId} columnId={column.id} />
      </div>
    </div>
  );
}