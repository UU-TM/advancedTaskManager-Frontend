"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { LayoutDashboard } from "lucide-react";
import { useActiveWorkspace } from "@/components/layout/active-workspace-context";
import { usePortfolio } from "@/hooks/use-portfolio";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";

export function PortfolioPageView() {
  const t = useTranslations("portfolio");
  const { workspaceId } = useActiveWorkspace();
  const { data, isLoading, isError } = usePortfolio(workspaceId);

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-6 md:px-6">
      <PageHeader title={t("title")} description={t("subtitle")} />

      {!workspaceId && (
        <EmptyState
          icon={LayoutDashboard}
          title={t("noWorkspace")}
          description={t("noWorkspaceBody")}
        />
      )}

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      )}

      {isError && (
        <EmptyState
          icon={LayoutDashboard}
          title={t("errorTitle")}
          description={t("errorBody")}
        />
      )}

      {data && (
        <div className="space-y-8">
          <section className="space-y-3">
            <h2 className="text-sm font-semibold">{t("boards")}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {data.boards.map((b) => (
                <Link
                  key={b.boardId}
                  href={`/boards/${b.boardId}`}
                  className="rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/40"
                >
                  <p className="font-medium">{b.boardName}</p>
                  <dl className="mt-2 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                    <div>
                      <dt>{t("wip")}</dt>
                      <dd className="font-medium text-foreground">{b.wip}</dd>
                    </div>
                    <div>
                      <dt>{t("overdue")}</dt>
                      <dd className="font-medium text-foreground">{b.overdue}</dd>
                    </div>
                    <div>
                      <dt>{t("blocked")}</dt>
                      <dd className="font-medium text-foreground">{b.blocked}</dd>
                    </div>
                  </dl>
                </Link>
              ))}
              {data.boards.length === 0 && (
                <p className="text-sm text-muted-foreground">{t("noBoards")}</p>
              )}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold">{t("sprints")}</h2>
            <ul className="space-y-2">
              {data.sprints.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
                >
                  <span className="font-medium">{s.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {t("cards", { count: s.cardCount })}
                    </span>
                    <Badge variant="secondary">{s.status}</Badge>
                  </div>
                </li>
              ))}
              {data.sprints.length === 0 && (
                <p className="text-sm text-muted-foreground">{t("noSprints")}</p>
              )}
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold">{t("goals")}</h2>
            <div className="space-y-3">
              {data.goals.map((g) => (
                <div
                  key={g.id}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{g.name}</p>
                    <Badge variant="outline">{g.status}</Badge>
                  </div>
                  <ul className="mt-3 space-y-2">
                    {g.keyResults.map((kr) => {
                      const pct =
                        kr.targetNumber > 0
                          ? Math.min(
                              100,
                              Math.round(
                                (kr.currentNumber / kr.targetNumber) * 100,
                              ),
                            )
                          : 0;
                      return (
                        <li key={kr.id} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>{kr.title}</span>
                            <span>
                              {kr.currentNumber}/{kr.targetNumber}
                            </span>
                          </div>
                          <Progress value={pct} className="h-1.5" />
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
              {data.goals.length === 0 && (
                <p className="text-sm text-muted-foreground">{t("noGoals")}</p>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
