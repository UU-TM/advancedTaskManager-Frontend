"use client";

import { useTranslations } from "next-intl";

export function LandingIntegrations() {
  const t = useTranslations("home.integrations");

  return (
    <section
      id="integrations"
      className="scroll-mt-20 px-5 py-20 md:px-8 md:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <h2 className="max-w-[14ch] text-4xl font-medium tracking-tight md:text-5xl">
          {t("title")}
        </h2>
        <div className="mt-16 grid gap-16 md:grid-cols-2 md:gap-20">
          <div>
            <h3 className="text-2xl font-medium tracking-tight md:text-3xl">
              {t("github.title")}
            </h3>
            <p className="mt-4 max-w-[38ch] text-base leading-relaxed text-muted-foreground">
              {t("github.body")}
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-medium tracking-tight md:text-3xl">
              {t("webhooks.title")}
            </h3>
            <p className="mt-4 max-w-[38ch] text-base leading-relaxed text-muted-foreground">
              {t("webhooks.body")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
