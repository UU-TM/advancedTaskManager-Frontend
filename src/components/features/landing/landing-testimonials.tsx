"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function LandingTestimonials() {
  const t = useTranslations("home.testimonials");
  const items = [0, 1, 2, 3, 4] as const;

  return (
    <section className="scroll-mt-20 bg-muted/40 px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">{t("eyebrow")}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            {t("title")}
          </h2>
        </div>

        <div className="mt-14 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {items.map((i) => (
            <motion.blockquote
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="mb-4 break-inside-avoid rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <p className="text-sm leading-relaxed text-foreground/90">
                &ldquo;{t(`items.${i}.quote`)}&rdquo;
              </p>
              <footer className="mt-4 flex items-center gap-3">
                <Avatar className="size-9">
                  <AvatarFallback className="bg-secondary text-xs text-secondary-foreground">
                    {t(`items.${i}.initials`)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <cite className="not-italic text-sm font-medium">
                    {t(`items.${i}.name`)}
                  </cite>
                  <p className="text-xs text-muted-foreground">
                    {t(`items.${i}.role`)}
                  </p>
                </div>
              </footer>
            </motion.blockquote>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary to-accent p-5 text-primary-foreground shadow-sm"
          >
            <div className="flex aspect-video items-center justify-center rounded-xl bg-black/20">
              <span className="flex size-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <Play className="ms-0.5 size-6 fill-current" />
              </span>
            </div>
            <p className="mt-4 text-sm font-medium">{t("videoLabel")}</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
