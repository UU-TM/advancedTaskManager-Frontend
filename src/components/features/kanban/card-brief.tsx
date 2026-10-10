"use client";

import { useLocale, useTranslations } from "next-intl";
import { formatAppDate } from "@/lib/date";
import type { Locale } from "@/i18n/config";
import type { Card, Checklist } from "@/types/domain";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function CardBrief({
  card,
  checklists,
  blockerNames,
}: {
  card: Card;
  checklists: Checklist[];
  blockerNames: string[];
}) {
  const t = useTranslations("brief");
  const tCard = useTranslations("card");
  const locale = useLocale() as Locale;
  const facts: string[] = [];

  if (card.dueDate) {
    const time = new Date(card.dueDate).getTime();
    const label = formatAppDate(card.dueDate, "d MMM", locale);
    if (label && !Number.isNaN(time) && time < Date.now() + WEEK_MS) {
      facts.push(
        time < Date.now()
          ? t("overdueOn", { date: label })
          : t("dueOn", { date: label }),
      );
    }
  }

  if (blockerNames.length > 0) {
    facts.push(t("blockedBy", { names: blockerNames.join(", ") }));
  } else if (card.isBlocked) {
    facts.push(t("cardBlocked"));
  }

  const items = checklists.flatMap((list) => list.items);
  if (items.length > 0) {
    const done = items.filter((item) => item.completed).length;
    if (done < items.length) {
      facts.push(t("checklistLeft", { done, total: items.length }));
      const open = items
        .filter((item) => !item.completed)
        .slice(0, 3)
        .map((item) => item.title);
      if (open.length > 0) facts.push(t("stillOpen", { items: open.join(", ") }));
    }
  }

  if (card.priority === "URGENT") facts.push(tCard("priorityUrgent"));
  else if (card.priority === "HIGH") facts.push(tCard("priorityHigh"));

  if ((card.assignees?.length ?? 0) === 0 && facts.length > 0) {
    facts.push(t("noAssignee"));
  }

  if (facts.length === 0) return null;

  return (
    <ul className="space-y-1 rounded-md bg-muted/60 px-3 py-2 text-sm">
      {facts.map((fact) => (
        <li key={fact}>{fact}</li>
      ))}
    </ul>
  );
}
