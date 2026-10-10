"use client";

import { useTranslations } from "next-intl";

export function LandingTestimonials() {
  const t = useTranslations("home.testimonials");
  const items = [0, 1, 2] as const;

  return (
    <section className="scroll-mt-20 px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-4xl font-medium tracking-tight md:text-5xl">
          {t("title")}
        </h2>
        <div className="mt-16 grid max-w-3xl gap-16">
          {items.map((i) => (
            <blockquote key={i}>
              <p className="text-xl font-medium leading-relaxed tracking-tight text-foreground md:text-2xl">
                &ldquo;{t(`items.${i}.quote`)}&rdquo;
              </p>
              <footer className="mt-5">
                <cite className="not-italic text-sm font-medium">
                  {t(`items.${i}.name`)}
                </cite>
                <p className="text-sm text-muted-foreground">
                  {t(`items.${i}.role`)}
                </p>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
