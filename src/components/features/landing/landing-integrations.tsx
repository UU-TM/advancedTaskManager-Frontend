"use client";

import { useTranslations } from "next-intl";
import { Marquee } from "@/components/ui/marquee";

const INTEGRATIONS = [
  "Slack",
  "GitHub",
  "Figma",
  "Notion",
  "Google Drive",
  "Jira",
  "Linear",
  "Gmail",
  "Outlook",
  "Calendar",
  "Zoom",
  "Discord",
  "Dropbox",
  "Airtable",
] as const;

function IntegrationChip({ name }: { name: string }) {
  return (
    <div className="flex h-14 items-center gap-3 rounded-xl border border-border bg-card px-5 shadow-sm">
      <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-xs font-bold text-foreground/70">
        {name.slice(0, 2).toUpperCase()}
      </span>
      <span className="whitespace-nowrap text-sm font-medium">{name}</span>
    </div>
  );
}

export function LandingIntegrations() {
  const t = useTranslations("home.integrations");
  const mid = Math.ceil(INTEGRATIONS.length / 2);
  const row1 = INTEGRATIONS.slice(0, mid);
  const row2 = INTEGRATIONS.slice(mid);

  return (
    <section
      id="integrations"
      className="scroll-mt-20 overflow-hidden px-5 py-20 md:px-8 md:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">{t("eyebrow")}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            {t("title")}
          </h2>
        </div>
      </div>

      <div className="relative mt-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 start-0 z-10 w-16 bg-gradient-to-r from-background to-transparent md:w-28"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 end-0 z-10 w-16 bg-gradient-to-l from-background to-transparent md:w-28"
        />
        <Marquee pauseOnHover className="[--duration:35s]">
          {row1.map((name) => (
            <IntegrationChip key={name} name={name} />
          ))}
        </Marquee>
        <Marquee reverse pauseOnHover className="mt-3 [--duration:35s]">
          {row2.map((name) => (
            <IntegrationChip key={name} name={name} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}
