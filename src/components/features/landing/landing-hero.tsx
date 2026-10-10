"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/use-auth";
import { HOME_ROUTE } from "@/lib/auth/config";
import { LandingOverview } from "./landing-overview";

function splitLine(text: string): [string, string] {
  const idx = text.indexOf(". ");
  if (idx === -1) return [text, ""];
  return [text.slice(0, idx + 1), text.slice(idx + 2)];
}

export function LandingHero() {
  const t = useTranslations("home");
  const { isAuthenticated } = useAuth();
  const [lead, rest] = splitLine(t("headline"));
  const primaryHref = isAuthenticated ? HOME_ROUTE : "/register";
  const primaryLabel = isAuthenticated ? t("openBoards") : t("getStarted");
  const secondaryHref = isAuthenticated ? "#features" : "/login";
  const secondaryLabel = isAuthenticated ? t("nav.features") : t("signIn");

  return (
    <section id="product" className="relative -mt-14 overflow-hidden bg-background pt-14">
      <div className="mx-auto flex max-w-[1024px] flex-col items-center px-6 pb-10 pt-24 text-center md:px-8 md:pb-16 md:pt-28">
        <p className="rounded-full bg-card/70 px-4 py-1.5 text-xs font-medium text-foreground/75">
          {t("eyebrow")}
        </p>
        <h1 className="font-display mt-7 max-w-[56rem] text-[40px] font-semibold leading-[1.05] text-foreground md:text-[60px] md:leading-[63px]">
          {lead}
          {rest ? (
            <>
              <br />
              <span className="text-foreground/55">{rest}</span>
            </>
          ) : null}
        </h1>
        <p className="mt-6 max-w-[36rem] text-base leading-7 text-muted-foreground">
          {t("subtitle")}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={primaryHref}
            className="inline-flex h-12 items-center rounded-full border border-[#357dff] bg-[#357dff] px-7 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] transition-[background-color,transform] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#2a6ef0] active:scale-[0.98]"
          >
            {primaryLabel}
          </Link>
          <Link
            href={secondaryHref}
            className="inline-flex h-12 items-center rounded-full bg-secondary px-5 text-sm font-semibold text-secondary-foreground transition-[background-color,transform] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-secondary/80 active:scale-[0.98]"
          >
            {secondaryLabel}
          </Link>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-2 py-2">
            <span className="size-3.5 rounded-full border border-border" />
            {t("trust.0")}
          </span>
          <span className="inline-flex items-center gap-2 py-2">
            <span className="size-3.5 rounded-full border border-border" />
            {t("trust.1")}
          </span>
        </div>
      </div>
      <LandingOverview />
    </section>
  );
}
