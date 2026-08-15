"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  BarChart3,
  Clock,
  LayoutTemplate,
  UsersRound,
} from "lucide-react";

const FEATURES = [
  { icon: UsersRound, key: "collaboration", span: "md:col-span-2" },
  { icon: Clock, key: "time", span: "md:col-span-1" },
  { icon: BarChart3, key: "tracking", span: "md:col-span-1" },
  { icon: LayoutTemplate, key: "workspaces", span: "md:col-span-2" },
] as const;

export function LandingFeatures() {
  const t = useTranslations("home.features");

  return (
    <section
      id="features"
      className="scroll-mt-20 bg-muted/40 px-5 py-20 md:px-8 md:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">{t("eyebrow")}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.key}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className={`group relative overflow-hidden rounded-2xl border border-border bg-card p-6 md:p-8 ${feature.span}`}
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -end-8 -top-8 size-32 rounded-full bg-primary/5 transition-transform duration-300 group-hover:scale-125"
                />
                <div className="relative">
                  <div className="mb-5 flex size-11 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight">
                    {t(`${feature.key}.title`)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
                    {t(`${feature.key}.description`)}
                  </p>

                  {/* Mini visual accent */}
                  <div className="mt-6 flex gap-2">
                    {[0, 1, 2].map((n) => (
                      <div
                        key={n}
                        className="h-16 flex-1 rounded-lg bg-muted/80 transition-colors group-hover:bg-muted"
                        style={{ opacity: 1 - n * 0.2 }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          {t("more")}
        </p>
      </div>
    </section>
  );
}
