"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

const EVENTS = [
  "hero.board.cards.0",
  "hero.board.cards.1",
  "hero.board.cards.3",
  "hero.board.cards.4",
] as const;

export function LandingFeatures() {
  const t = useTranslations("home");

  return (
    <section id="features" className="scroll-mt-24 bg-background px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-[1152px]">
        <header className="mx-auto max-w-[40rem] text-center">
          <p className="text-sm text-muted-foreground">{t("features.eyebrow")}</p>
          <h2 className="font-display mt-4 text-[32px] font-semibold leading-[1.08] text-foreground md:text-[36px]">
            {t("features.title")}
            <span className="mt-1 block text-foreground/55">{t("features.subtitle")}</span>
          </h2>
        </header>

        <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <FeatureCard
            kicker={t("features.collaboration.title")}
            title={t("features.collaboration.title")}
            body={t("features.collaboration.description")}
          >
            <RollingList />
          </FeatureCard>
          <FeatureCard
            kicker={t("features.whiteboard.title")}
            title={t("features.whiteboard.title")}
            body={t("features.whiteboard.description")}
          >
            <CanvasPreview />
          </FeatureCard>
          <FeatureCard
            kicker={t("features.time.title")}
            title={t("features.time.title")}
            body={t("features.time.description")}
          >
            <WeekPreview />
          </FeatureCard>
          <FeatureCard
            kicker={t("features.tracking.title")}
            title={t("features.tracking.title")}
            body={t("features.tracking.description")}
          >
            <FunnelPreview />
          </FeatureCard>
          <FeatureCard
            kicker={t("features.workspaces.title")}
            title={t("features.workspaces.title")}
            body={t("features.workspaces.description")}
          >
            <TeamPreview />
          </FeatureCard>
          <FeatureCard
            kicker={t("integrations.eyebrow")}
            title={t("integrations.github.title")}
            body={t("integrations.github.body")}
          >
            <ProviderPreview />
          </FeatureCard>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  kicker,
  title,
  body,
  children,
}: {
  kicker: string;
  title: string;
  body: string;
  children: ReactNode;
}) {
  return (
    <article className="flex flex-col overflow-hidden rounded-[28px] border border-border/55 bg-card transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1">
      <div className="relative h-[230px] overflow-hidden bg-muted">{children}</div>
      <div className="px-6 pb-7 pt-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {kicker}
        </p>
        <h3 className="font-display mt-2 text-xl font-medium tracking-[-0.02em] text-foreground">
          {title}
        </h3>
        <p className="mt-2 text-[15px] leading-6 text-muted-foreground">{body}</p>
      </div>
    </article>
  );
}

function RollingList() {
  const t = useTranslations("home");
  return (
    <ul className="flex h-full flex-col justify-center gap-2 px-6">
      {EVENTS.map((key, i) => (
        <li
          key={key}
          className="wm-row rounded-2xl border border-border bg-card px-4 py-3 shadow-[0_10px_24px_-18px_rgba(0,0,0,0.35)]"
          style={{ animationDelay: `${i * -2.1}s` }}
        >
          <p className="truncate text-[13px] font-medium text-foreground">{t(key)}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{t(`hero.board.columns.${i % 3}`)}</p>
        </li>
      ))}
    </ul>
  );
}

function CanvasPreview() {
  const t = useTranslations("home");
  return (
    <div className="relative h-full">
      <div className="absolute start-8 top-8 w-36 rotate-[-6deg] rounded-xl bg-[#fde68a] p-3 text-[12px] font-medium text-[#0a0a0a] shadow-sm">
        {t("hero.whiteboard.note0")}
      </div>
      <div className="absolute end-8 top-16 w-32 rotate-[4deg] rounded-xl bg-[#bbf7d0] p-3 text-[12px] font-medium text-[#0a0a0a] shadow-sm">
        {t("hero.whiteboard.note1")}
      </div>
      <div className="absolute start-16 bottom-8 rounded-2xl border border-border bg-card px-4 py-3 text-[12px] shadow-sm">
        <p className="font-semibold">{t("hero.whiteboard.frame")}</p>
        <p className="text-muted-foreground">{t("hero.whiteboard.frameHint")}</p>
      </div>
    </div>
  );
}

function WeekPreview() {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const heights = [35, 55, 40, 70, 48, 20, 28];
  return (
    <div className="flex h-full items-end gap-2 px-8 pb-8 pt-16">
      {days.map((d, i) => (
        <div key={`${d}-${i}`} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex h-28 w-full items-end">
            <div
              className="w-full rounded-md bg-[#357dff]"
              style={{ height: `${heights[i]}%`, opacity: i === 3 ? 1 : 0.35 }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground">{d}</span>
        </div>
      ))}
    </div>
  );
}

function FunnelPreview() {
  const t = useTranslations("home");
  const rows = [
    { label: t("hero.board.columns.0"), width: "100%" },
    { label: t("hero.board.columns.1"), width: "62%" },
    { label: t("hero.board.columns.2"), width: "34%" },
  ];
  return (
    <div className="flex h-full flex-col justify-center gap-3 px-8">
      {rows.map((row) => (
        <div key={row.label}>
          <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
            <span>{row.label}</span>
          </div>
          <div className="h-7 overflow-hidden rounded-lg bg-[#e8eefc] dark:bg-[#1c2a44]">
            <div
              className="wm-sweep h-full rounded-lg bg-[#357dff]"
              style={{ width: row.width }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function TeamPreview() {
  const t = useTranslations("home");
  const people = [
    t("testimonials.items.0.initials"),
    t("testimonials.items.1.initials"),
    t("testimonials.items.2.initials"),
  ];
  const names = [
    t("testimonials.items.0.name"),
    t("testimonials.items.1.name"),
    t("testimonials.items.2.name"),
  ];
  const roles = [
    t("testimonials.items.0.role"),
    t("testimonials.items.1.role"),
    t("testimonials.items.2.role"),
  ];
  return (
    <ul className="flex h-full flex-col justify-center gap-2 px-6">
      {people.map((initials, i) => (
        <li
          key={initials}
          className="flex items-center gap-3 rounded-2xl bg-card px-3 py-2.5 shadow-[0_8px_20px_-16px_rgba(0,0,0,0.4)]"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-[#eef4ff] text-[11px] font-semibold text-[#357dff] dark:bg-accent dark:text-accent-foreground">
            {initials}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-medium">{names[i]}</span>
            <span className="block truncate text-[11px] text-muted-foreground">{roles[i]}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function ProviderPreview() {
  const t = useTranslations("home");
  const names = [
    t("integrations.github.title"),
    t("integrations.webhooks.title"),
    "MCP",
  ];
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      {names.map((name, i) => (
        <span
          key={name}
          className="wm-row rounded-full bg-card px-5 py-2 text-sm font-semibold shadow-[0_10px_24px_-16px_rgba(0,0,0,0.35)]"
          style={{ animationDelay: `${i * -2.8}s` }}
        >
          {name}
        </span>
      ))}
    </div>
  );
}
