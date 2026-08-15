"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const PLANS = ["basic", "pro", "advanced"] as const;

export function LandingPricing() {
  const t = useTranslations("home.pricing");
  const [yearly, setYearly] = useState(true);

  return (
    <section id="pricing" className="scroll-mt-20 px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">{t("eyebrow")}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-muted-foreground">{t("subtitle")}</p>

          <div className="relative mt-8 inline-flex items-center gap-3">
            <Label
              htmlFor="billing-toggle"
              className={cn(
                "text-sm",
                !yearly ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {t("monthly")}
            </Label>
            <Switch
              id="billing-toggle"
              checked={yearly}
              onCheckedChange={setYearly}
              aria-label={t("toggleAria")}
            />
            <Label
              htmlFor="billing-toggle"
              className={cn(
                "text-sm",
                yearly ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {t("yearly")}
            </Label>
            <span className="absolute -end-16 -top-5 rotate-12 text-xs font-semibold text-accent md:-end-20">
              {t("saveBadge")}
            </span>
          </div>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {PLANS.map((plan, i) => {
            const featured = plan === "pro";
            const price = yearly
              ? t(`plans.${plan}.priceYearly`)
              : t(`plans.${plan}.priceMonthly`);

            return (
              <motion.div
                key={plan}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className={cn(
                  "relative flex flex-col rounded-2xl border p-6 md:p-8",
                  featured
                    ? "border-primary bg-card shadow-lg shadow-primary/10 ring-1 ring-primary/20"
                    : "border-border bg-card"
                )}
              >
                {featured && (
                  <span className="absolute -top-3 inset-x-0 mx-auto w-fit rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
                    {t("popular")}
                  </span>
                )}
                <div>
                  <h3 className="text-lg font-semibold">
                    {t(`plans.${plan}.name`)}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t(`plans.${plan}.description`)}
                  </p>
                </div>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold tracking-tight">
                    ${price}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {yearly ? t("perYear") : t("perMonth")}
                  </span>
                </div>
                <Button
                  asChild
                  className="mt-6 w-full"
                  variant={featured ? "default" : "outline"}
                >
                  <Link href="/register">{t("cta")}</Link>
                </Button>
                <ul className="mt-6 flex-1 space-y-3">
                  {[0, 1, 2, 3, 4].map((fi) => (
                    <li
                      key={fi}
                      className="flex items-start gap-2.5 text-sm text-muted-foreground"
                    >
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span>{t(`plans.${plan}.features.${fi}`)}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
