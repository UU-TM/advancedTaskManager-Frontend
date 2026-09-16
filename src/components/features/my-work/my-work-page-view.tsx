"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  AlertTriangle,
  AtSign,
  Ban,
  CalendarClock,
  Inbox,
  Timer,
} from "lucide-react";
import { useMyWork } from "@/hooks/use-my-work";
import { useWorkSuggest } from "@/hooks/use-ai";
import { useStartTimeEntry } from "@/hooks/use-time-entries";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import type { WorkCard } from "@/types/domain";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

function WorkSection({
  title,
  icon: Icon,
  cards,
  empty,
}: {
  title: string;
  icon: typeof Inbox;
  cards: WorkCard[];
  empty: string;
}) {
  const startTimer = useStartTimeEntry();
  const t = useTranslations("myWork");

  if (cards.length === 0) {
    return (
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Icon className="size-4" />
          {title}
        </h2>
        <p className="text-sm text-muted-foreground/80">{empty}</p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        <Icon className="size-4 text-primary" />
        {title}
        <Badge variant="secondary" className="ms-1">
          {cards.length}
        </Badge>
      </h2>
      <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
        {cards.map((card) => (
          <li
            key={card.id}
            className="flex flex-wrap items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
          >
            <div className="min-w-0 flex-1">
              <Link
                href={`/boards/${card.boardId}?card=${card.id}`}
                className="font-medium hover:underline"
              >
                {card.title}
              </Link>
              <p className="truncate text-xs text-muted-foreground">
                {card.boardName} · {card.columnTitle}
                {card.isBlocked ? ` · ${t("blockedBadge")}` : ""}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="cursor-pointer"
              onClick={() =>
                startTimer.mutate(card.id, {
                  onSuccess: () => toast.success(t("timerStarted")),
                  onError: () => toast.error(t("timerFailed")),
                })
              }
            >
              <Timer className="me-1.5 size-3.5" />
              {t("startTimer")}
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function MyWorkPageView() {
  const t = useTranslations("myWork");
  const tAi = useTranslations("ai");
  const { data, isLoading, isError } = useMyWork();
  const suggest = useWorkSuggest(true);

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-6 md:px-6">
      <PageHeader title={t("title")} description={t("subtitle")} />

      {suggest.data && suggest.data.suggestions.length > 0 && (
        <section className="space-y-3 rounded-xl border border-border bg-card p-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="size-4 text-primary" />
            {tAi("whatNext")}
            <Badge variant="outline" className="ms-1 text-[10px]">
              {suggest.data.source}
            </Badge>
          </h2>
          <ol className="space-y-2">
            {suggest.data.suggestions.slice(0, 5).map((s) => (
              <li key={s.card.id} className="flex items-center gap-3 text-sm">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {s.rank}
                </span>
                <Link
                  href={`/boards/${s.card.boardId}?card=${s.card.id}`}
                  className="min-w-0 flex-1 truncate font-medium hover:underline"
                >
                  {s.card.title}
                </Link>
                <span className="text-xs text-muted-foreground">
                  {s.card.boardName}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      )}

      {isError && (
        <EmptyState
          icon={Inbox}
          title={t("errorTitle")}
          description={t("errorBody")}
        />
      )}

      {data && (
        <div className="space-y-8">
          <WorkSection
            title={t("overdue")}
            icon={AlertTriangle}
            cards={data.overdue}
            empty={t("overdueEmpty")}
          />
          <WorkSection
            title={t("dueSoon")}
            icon={CalendarClock}
            cards={data.dueSoon}
            empty={t("dueSoonEmpty")}
          />
          <WorkSection
            title={t("blocked")}
            icon={Ban}
            cards={data.blocked}
            empty={t("blockedEmpty")}
          />
          <WorkSection
            title={t("mentioned")}
            icon={AtSign}
            cards={data.mentioned}
            empty={t("mentionedEmpty")}
          />
          <WorkSection
            title={t("assigned")}
            icon={Inbox}
            cards={data.assigned}
            empty={t("assignedEmpty")}
          />
        </div>
      )}
    </div>
  );
}
