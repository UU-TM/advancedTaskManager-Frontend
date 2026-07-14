"use client";

import Link from "next/link";
import { Plus, Trello } from "lucide-react";
import { AppShell } from "@/components/layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Boards route (protected)
 * ----------------------------------------------------
 * Once the backend ships `GET /boards` (and the
 * `GET /workspaces/:id/boards` route), this page will
 * list the user's boards grouped by workspace. For now
 * it renders a friendly placeholder so the route exists
 * and the middleware redirect is testable.
 */
export default function BoardsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Boards</h1>
            <p className="text-sm text-muted-foreground">
              Pick a board to open its kanban view.
            </p>
          </div>
          <Button>
            <Plus className="mr-2 size-4" />
            New board
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <Skeleton className="size-9 rounded-md" />
                  <Badge variant="outline">Draft</Badge>
                </div>
                <Skeleton className="mt-2 h-5 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-6 border-dashed">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-md bg-info/15 text-info">
                <Trello className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base">Waiting on the backend</CardTitle>
                <CardDescription>
                  The boards list will appear here once{" "}
                  <code className="rounded bg-muted px-1 py-0.5 text-[11px]">
                    GET /workspaces/:id/boards
                  </code>{" "}
                  is implemented.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link href="/dev/components">Preview components instead</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
