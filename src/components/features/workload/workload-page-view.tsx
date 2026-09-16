"use client";

import { useTranslations } from "next-intl";
import { Users } from "lucide-react";
import { useActiveWorkspace } from "@/components/layout/active-workspace-context";
import { useWorkload } from "@/hooks/use-workload";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

function loadLevel(openCards: number, max: number): number {
  if (max <= 0) return 0;
  return Math.min(1, openCards / max);
}

export function WorkloadPageView() {
  const t = useTranslations("workload");
  const { workspaceId } = useActiveWorkspace();
  const { data = [], isLoading, isError } = useWorkload(workspaceId);
  const maxOpen = Math.max(1, ...data.map((a) => a.openCards));

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-6 md:px-6">
      <PageHeader title={t("title")} description={t("subtitle")} />

      {!workspaceId && (
        <EmptyState
          icon={Users}
          title={t("noWorkspace")}
          description={t("noWorkspaceBody")}
        />
      )}

      {workspaceId && isLoading && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      )}

      {isError && (
        <EmptyState
          icon={Users}
          title={t("errorTitle")}
          description={t("errorBody")}
        />
      )}

      {workspaceId && !isLoading && data.length === 0 && (
        <EmptyState
          icon={Users}
          title={t("emptyTitle")}
          description={t("emptyBody")}
        />
      )}

      {data.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((a) => {
            const level = loadLevel(a.openCards, maxOpen);
            return (
              <div
                key={a.userId}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-medium">{a.username}</p>
                  <span className="text-xs text-muted-foreground">
                    {t("openCards", { count: a.openCards })}
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      level > 0.75
                        ? "bg-destructive"
                        : level > 0.45
                          ? "bg-amber-500"
                          : "bg-primary",
                    )}
                    style={{ width: `${Math.max(8, level * 100)}%` }}
                  />
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>
                    <dt>{t("estimate")}</dt>
                    <dd className="font-medium text-foreground">
                      {a.estimateMinutes}m
                    </dd>
                  </div>
                  <div>
                    <dt>{t("timeSpent")}</dt>
                    <dd className="font-medium text-foreground">
                      {Math.round(a.timeSpentMs / 60000)}m
                    </dd>
                  </div>
                </dl>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
