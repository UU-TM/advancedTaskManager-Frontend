"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Eye, Share2, Users } from "lucide-react";

const ICONS = [Users, Share2, Eye] as const;

export function LandingSolutions() {
  const t = useTranslations("home.solutions");

  return (
    <section id="solutions" className="scroll-mt-20 px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">{t("eyebrow")}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            {t("title")}
          </h2>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {[0, 1, 2].map((i) => {
            const Icon = ICONS[i];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="text-center md:text-start"
              >
                <div className="mx-auto mb-4 flex size-11 items-center justify-center rounded-xl bg-secondary text-secondary-foreground md:mx-0">
                  <Icon className="size-5" />
                </div>
                <p className="text-base leading-relaxed text-muted-foreground">
                  {t(`items.${i}` as "items.0")}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Product showcase strip */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="mt-16 overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-foreground/5"
        >
          <div className="border-b border-border bg-muted/40 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-destructive/70" />
              <span className="size-2.5 rounded-full bg-accent/70" />
              <span className="size-2.5 rounded-full bg-primary/70" />
              <span className="ms-3 text-xs text-muted-foreground">
                {t("showcaseLabel")}
              </span>
            </div>
          </div>
          <div className="grid gap-3 bg-gradient-to-b from-muted/30 to-background p-4 sm:grid-cols-3 md:gap-4 md:p-6">
            {["To Do", "In Progress", "Done"].map((col, ci) => (
              <div key={col} className="rounded-xl bg-muted/60 p-3">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t(`columns.${ci}` as "columns.0")}
                </p>
                <div className="space-y-2">
                  {Array.from({ length: 3 - ci }).map((_, ti) => (
                    <div
                      key={ti}
                      className="rounded-lg border border-border/60 bg-card p-3 shadow-sm"
                    >
                      <div className="mb-2 h-2.5 w-3/4 rounded bg-foreground/10" />
                      <div className="h-2 w-1/2 rounded bg-foreground/5" />
                      {ti === 0 && (
                        <div className="mt-2.5 flex gap-1">
                          <span className="h-5 w-12 rounded-md bg-primary/20" />
                          <span className="h-5 w-10 rounded-md bg-accent/20" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
