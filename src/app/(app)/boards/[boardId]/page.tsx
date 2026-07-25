"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Trello } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Board detail placeholder — Kanban UI lands in a later task.
 */
export default function BoardDetailPage() {
  const params = useParams<{ boardId: string }>();
  const boardId = params.boardId;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link href="/boards">
          <ArrowLeft className="mr-2 size-4" />
          Back to boards
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-md bg-primary/15 text-primary">
              <Trello className="size-5" />
            </div>
            <div>
              <CardTitle>Board</CardTitle>
              <CardDescription className="font-mono text-xs">{boardId}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Kanban view coming soon. This route exists so board cards can
          navigate here from the boards grid.
        </CardContent>
      </Card>
    </div>
  );
}
