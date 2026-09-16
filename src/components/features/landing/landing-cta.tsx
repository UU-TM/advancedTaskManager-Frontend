"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { HOME_ROUTE } from "@/lib/auth/config";
import { Button } from "@/components/ui/button";

export function LandingCta() {
  const t = useTranslations("home.cta");
  const { isAuthenticated } = useAuth();
  const href = isAuthenticated ? HOME_ROUTE : "/register";

  return (
    <section className="px-5 py-20 md:px-8 md:py-28">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.45 }}
        className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-secondary/80 via-card to-card px-6 py-14 text-center md:px-16 md:py-20"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_80%_50%,_#0f766e33_0%,_transparent_60%),radial-gradient(ellipse_40%_50%_at_20%_80%,_#c2410c22_0%,_transparent_55%)] dark:bg-[radial-gradient(ellipse_60%_80%_at_80%_50%,_#5eead428_0%,_transparent_60%),radial-gradient(ellipse_40%_50%_at_20%_80%,_#fb923c22_0%,_transparent_55%)]"
        />
        <div className="relative z-10 mx-auto max-w-xl">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-muted-foreground">{t("subtitle")}</p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <Button asChild size="lg" className="h-11 px-8">
              <Link href={href}>
                {t("button")}
                <ArrowRight className="ms-1 size-4 rtl:rotate-180" />
              </Link>
            </Button>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5" />
              {t("note")}
            </p>
          </div>
        </div>

        {/* Decorative board mock */}
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-8 -end-4 hidden w-72 rotate-6 opacity-40 md:block lg:opacity-60"
        >
          <div className="rounded-xl border border-border bg-card p-3 shadow-xl">
            <div className="grid grid-cols-2 gap-2">
              <div className="h-20 rounded-lg bg-muted" />
              <div className="h-20 rounded-lg bg-primary/10" />
              <div className="h-14 rounded-lg bg-accent/10" />
              <div className="h-14 rounded-lg bg-muted" />
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
