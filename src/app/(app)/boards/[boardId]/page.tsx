"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Trello } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Column } from "@/components/features/kanban/Column"
import { CreateColumnDialog } from "@/components/features/kanban/CreateColumnDialog"
import { useBoard } from "@/hooks/use-boards";
import { useColumns } from "@/hooks/use-columns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function BoardDetailPage() {
  const params = useParams<{ boardId: string }>();
  const boardId = params.boardId;
  const { data: board } = useBoard(boardId);
  const { data: columns, isLoading, isError } = useColumns(boardId);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link href="/boards">
          <ArrowLeft className="mr-2 size-4" />
          Back to boards
        </Link>
      </Button>

      <h1 className="text-2xl font-semibold tracking-tight mb-6">{board?.name ?? "Loading..."}</h1>

      {isLoading && <p className="text-muted-foreground">Loading columns...</p>}
      {isError && <p className="text-destructive">Failed to load columns.</p>}

      

      {columns && (
        <div className="flex flex-row gap-4 overflow-x-auto">
          {columns.map((column) => (
            <Column key={column.id} column={column} />

          ))}

          <CreateColumnDialog boardId={boardId} />
        </div>
      )}
      
      

    </div>
  );
}
