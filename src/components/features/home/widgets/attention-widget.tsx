"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { AtSign, Ban, ListChecks, Timer } from "lucide-react";
import { toast } from "sonner";
import { useMyWork } from "@/hooks/use-my-work";
import { useWorkSuggest } from "@/hooks/use-ai";
import { useStartTimeEntry } from "@/hooks/use-time-entries";
import {
  usePowerUpEnabled,
  usePowerUpEnabledAnywhere,
} from "@/hooks/use-power-ups";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SmartListsPanel } from "@/components/features/my-work/smart-lists-panel";
import type { WorkCard } from "@/types/domain";
import { WidgetShell } from "./widget-shell";

function CardTimerButton({
  boardId,
  cardId,
}: {
  boardId: string;
  cardId: string;
}) {
  const t = useTranslations("myWork");
  const startTimer = useStartTimeEntry();
  const timeOn = usePowerUpEnabled(boardId, "time-tracking");
  if (!timeOn) return null;
  return (
    <Button
      size="sm"
      variant="outline"
      className="cursor-pointer"
      onClick={() =>
        startTimer.mutate(cardId, {
          onSuccess: () => toast.success(t("timerStarted")),
          onError: () => toast.error(t("timerFailed")),
        })
      }
    >
      <Timer className="me-1.5 size-3.5" />
      {t("startTimer")}
    </Button>
  );
}

function WorkSection({
  title,
  icon: Icon,
  cards,
  empty,
}: {
  title: string;
  icon: typeof Ban;
  cards: WorkCard[];
  empty: string;
}) {
  const t = useTranslations("myWork");

  if (cards.length === 0) {
    return (
      <section className="space-y-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Icon className="size-4 text-muted-foreground" />
          {title}
        </h3>
        <p className="text-sm text-muted-foreground">{empty}</p>
      </section>
    );
  }

  return (
    <section className="space-y-2">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <Icon className="size-4 text-primary" />
        {title}
        <Badge variant="secondary" className="ms-1">
          {cards.length}
        </Badge>
      </h3>
      <ul className="divide-y divide-border overflow-hidden rounded-md border border-border">
        {cards.map((card) => (
          <li
            key={card.id}
            className="flex flex-wrap items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted/40"
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
            <CardTimerButton boardId={card.boardId} cardId={card.id} />
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Blocked, mentioned, AI suggestions, and smart lists — the My Work extras on Home. */
export function AttentionWidget() {
  const t = useTranslations("myWork");
  const tAi = useTranslations("ai");
  const { data, isLoading } = useMyWork();
  const suggestOn = usePowerUpEnabledAnywhere("suggest-next");
  const suggest = useWorkSuggest(suggestOn);

  return (
    <div className="space-y-4">
      {suggest.data && suggest.data.suggestions.length > 0 && (
        <WidgetShell>
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold tracking-tight">
            <ListChecks className="size-4 text-muted-foreground" aria-hidden />
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
        </WidgetShell>
      )}

      <WidgetShell>
        <div className="space-y-6">
          {isLoading && (
            <div className="space-y-3">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-20 w-full" />
            </div>
          )}
          {data && (
            <>
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
            </>
          )}
        </div>
      </WidgetShell>

      <SmartListsPanel />
    </div>
  );
}
