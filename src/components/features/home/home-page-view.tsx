"use client";

import { useLocale, useTranslations } from "next-intl";
import { useAuth } from "@/hooks/use-auth";
import { useHome } from "@/hooks/use-home";
import { cn } from "@/lib/utils";
import { AssignedTasksWidget } from "./widgets/assigned-tasks-widget";
import { AttentionWidget } from "./widgets/attention-widget";
import { DueSoonWidget } from "./widgets/due-soon-widget";
import { TodoListWidget } from "./widgets/todo-list-widget";
import { WeekStripWidget } from "./widgets/week-strip-widget";

function greetingKey():
  | "greetingMorning"
  | "greetingAfternoon"
  | "greetingEvening" {
  const hour = new Date().getHours();
  if (hour < 12) return "greetingMorning";
  if (hour < 18) return "greetingAfternoon";
  return "greetingEvening";
}

export function HomePageView() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const { user } = useAuth();
  const { data } = useHome();
  const displayName = user?.displayName ?? user?.username ?? "";
  const titleText = displayName
    ? t(greetingKey(), { name: displayName })
    : t("title");

  const assigned =
    data?.assignedCards.filter((card) => !card.archivedAt).length ?? 0;
  const due = data?.dueSoon.length ?? 0;
  const boards = new Set([
    ...(data?.recentBoards ?? []).map((board) => board.id),
    ...(data?.starredBoards ?? []).map((board) => board.id),
  ]).size;

  const stats = [
    { label: t("overview.assigned"), value: assigned },
    { label: t("overview.due"), value: due },
    { label: t("overview.boards"), value: boards },
  ];

  return (
    <div
      className={cn(
        "flex flex-col gap-4 px-5 py-8 md:px-8",
        locale !== "fa" && "font-waymark",
      )}
    >
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {t("overview.label")}
        </p>
        <h1 className="font-display mt-2 text-[32px] font-semibold leading-[1.05] tracking-[-0.03em] text-foreground md:text-[40px]">
          {titleText}
        </h1>
        <p className="mt-3 max-w-xl text-[15px] text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-[18px] border border-border/80 bg-card px-5 py-4 text-card-foreground shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_18px_40px_-28px_rgba(0,0,0,0.35)]"
          >
            <p className="text-[12px] text-muted-foreground">{stat.label}</p>
            <p className="font-display mt-2 text-[32px] font-semibold leading-none tracking-[-0.04em]">
              {stat.value}
            </p>
          </div>
        ))}
      </div>
      <WeekStripWidget />
      <div className="grid items-stretch gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7 [&>section]:h-full">
          <AssignedTasksWidget />
        </div>
        <div className="flex flex-col gap-4 lg:col-span-5 [&>section:last-child]:min-h-0 [&>section:last-child]:flex-1">
          <DueSoonWidget />
          <TodoListWidget />
        </div>
      </div>
      <AttentionWidget />
    </div>
  );
}
