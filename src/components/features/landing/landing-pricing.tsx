"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { HOME_ROUTE } from "@/lib/auth/config";
import { cn } from "@/lib/utils";

const PLANS = ["free", "team", "business"] as const;

export function LandingPricing() {
  const t = useTranslations("home.pricing");
  const tHome = useTranslations("home");
  const { isAuthenticated } = useAuth();

  return (
    <section id="pricing" className="scroll-mt-24 bg-background px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-[1152px]">
        <div className="mx-auto max-w-[40rem] text-center">
          <p className="text-sm text-muted-foreground">{t("eyebrow")}</p>
          <h2 className="font-display mt-4 text-[32px] font-semibold leading-[1.05] text-foreground md:text-[36px]">
            {t("title")}
          </h2>
          <p className="mt-4 text-[15px] leading-6 text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {PLANS.map((plan) => {
            const featured = plan === "team";
            const href =
              isAuthenticated && plan !== "free"
                ? "/billing"
                : isAuthenticated
                  ? HOME_ROUTE
                  : "/register";

            return (
              <div
                key={plan}
                className={cn(
                  "flex flex-col rounded-[28px] border border-border/70 bg-card p-7",
                  featured && "shadow-[0_24px_60px_-32px_rgba(53,125,255,0.55)]",
                )}
              >
                <div className="min-h-16">
                  {featured && (
                    <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[#357dff]">
                      {t("popular")}
                    </p>
                  )}
                  <h3 className="font-display text-2xl font-medium tracking-[-0.03em]">
                    {t(`plans.${plan}.name`)}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t(`plans.${plan}.description`)}
                  </p>
                </div>
                <p className="mt-8 text-sm font-medium text-foreground">
                  {t(`plans.${plan}.priceLabel`)}
                </p>
                <Link
                  href={href}
                  className={cn(
                    "mt-6 inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold transition-[background-color,transform] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98]",
                    featured
                      ? "bg-[#357dff] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] hover:bg-[#2a6ef0]"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                  )}
                >
                  {isAuthenticated
                    ? plan === "free"
                      ? tHome("openBoards")
                      : t("manageBilling")
                    : tHome("getStarted")}
                </Link>
                <ul className="mt-8 flex-1 space-y-3">
                  {[0, 1, 2, 3].map((fi) => (
                    <li key={fi} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <Check className="mt-0.5 size-4 shrink-0 text-foreground" />
                      <span>{t(`plans.${plan}.features.${fi}`)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
