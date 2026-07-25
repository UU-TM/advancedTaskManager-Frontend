"use client";

import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Workspace route stub (protected via AppShell layout).
 */
export default function WorkspacePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Workspaces</h1>
          <p className="text-sm text-muted-foreground">
            Workspaces group related boards and members.
          </p>
        </div>
        <Button disabled>
          <Plus className="mr-2 size-4" />
          New workspace
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <Skeleton className="size-9 rounded-md" />
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
              <Users className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base">Coming soon</CardTitle>
              <CardDescription>
                Multi-workspace management will land here. Boards use your
                default workspace automatically.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
