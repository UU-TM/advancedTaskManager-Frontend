"use client";

import { useTranslations } from "next-intl";
import { Check, Radio } from "lucide-react";

const WASH = [
  "bg-[#e7edff] dark:bg-[#1a2744]",
  "bg-[#f8f3e3] dark:bg-[#2a2618]",
  "bg-[#e5f6ef] dark:bg-[#14261e]",
] as const;

function splitLine(text: string): [string, string] {
  const idx = text.indexOf(". ");
  if (idx === -1) return [text, ""];
  return [text.slice(0, idx + 1), text.slice(idx + 2)];
}

export function LandingWorkflow() {
  const t = useTranslations("home");
  const [lead, rest] = splitLine(t("workflow"));
  const steps = [0, 1, 2] as const;

  return (
    <section id="how-it-works" className="scroll-mt-24 bg-background px-5 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-[1152px]">
        <div className="mx-auto max-w-[40rem] text-center">
          <p className="text-sm text-muted-foreground">{t("nav.how")}</p>
          <h2 className="font-display mt-4 text-[32px] font-semibold leading-[1.05] text-foreground md:text-[36px] md:leading-[37.8px]">
            {lead}
            {rest ? (
              <>
                <br />
                {rest}
              </>
            ) : null}
          </h2>
          <p className="mx-auto mt-4 max-w-[36rem] text-[15px] leading-6 text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {steps.map((i) => (
            <article key={i}>
              <div className={`rounded-[28px] p-3 ${WASH[i]}`}>
                <StepPreview index={i} />
              </div>
              <p className="mt-5 text-sm text-muted-foreground">
                {t(`solutions.tabs.${i}.label`)}
              </p>
              <h3 className="font-display mt-1 text-xl font-medium tracking-[-0.02em] text-foreground">
                {t(`solutions.tabs.${i}.heading`)}
              </h3>
              <p className="mt-2 text-[15px] leading-6 text-muted-foreground">
                {t(`solutions.tabs.${i}.body`)}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function StepPreview({ index }: { index: number }) {
  const t = useTranslations("home");

  if (index === 0) {
    return (
      <div className="rounded-2xl bg-card p-4 shadow-[0_8px_24px_-16px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-semibold">{t("hero.board.name")}</p>
            <p className="text-[11px] text-muted-foreground">{t("hero.board.label")}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef4ff] px-2.5 py-1 text-[11px] font-medium text-[#357dff] dark:bg-accent dark:text-accent-foreground">
            <span className="relative flex size-1.5">
              <span className="wm-ping absolute inline-flex size-full rounded-full bg-[#357dff] opacity-70" />
              <span className="relative size-1.5 rounded-full bg-[#357dff]" />
            </span>
            {t("solutions.tabs.0.cards.2")}
          </span>
        </div>
        <ul className="mt-4 space-y-2 text-[12px] text-foreground">
          {[0, 1, 2].map((i) => (
            <li key={i} className="flex items-center justify-between rounded-lg bg-muted px-3 py-2">
              <span>{t(`hero.board.cards.${i}`)}</span>
              <span className="text-muted-foreground">{t(`hero.board.columns.${i}`)}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className="rounded-2xl bg-card p-4 shadow-[0_8px_24px_-16px_rgba(0,0,0,0.25)]">
        <div className="flex items-center gap-2 text-[13px] font-semibold">
          <Radio className="size-3.5 text-muted-foreground" />
          {t("hero.whiteboard.name")}
        </div>
        <ul className="mt-4 space-y-2">
          {[0, 1, 2].map((i) => (
            <li
              key={i}
              className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-[12px]"
              style={{ animationDelay: `${i * 0.4}s` }}
            >
              <span className="font-medium">{t(`solutions.tabs.1.cards.${i}`)}</span>
              <span className="text-muted-foreground">{i === 0 ? t("hero.whiteboard.note0") : t("hero.whiteboard.frame")}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card p-4 shadow-[0_8px_24px_-16px_rgba(0,0,0,0.25)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[13px] font-semibold">{t("solutions.tabs.2.cards.1")}</p>
          <p className="text-[11px] text-muted-foreground">{t("solutions.tabs.2.label")}</p>
        </div>
        <Check className="size-4 text-[#16a34a]" />
      </div>
      <p className="font-display mt-6 text-[32px] font-semibold leading-none tracking-[-0.04em]">
        14
      </p>
      <p className="mt-1 text-[12px] text-muted-foreground">{t("solutions.tabs.2.cards.2")}</p>
      <div className="mt-4 flex h-16 items-end gap-1.5">
        {[40, 55, 48, 70, 92].map((h, i) => (
          <div
            key={i}
            className="wm-sweep flex-1 rounded-t-md bg-[#357dff]"
            style={{ height: `${h}%`, animationDelay: `${i * 0.08}s` }}
          />
        ))}
      </div>
    </div>
  );
}
