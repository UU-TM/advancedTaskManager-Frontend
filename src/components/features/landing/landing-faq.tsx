"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function LandingFaq() {
  const t = useTranslations("home.faq");
  const items = [0, 1, 2, 3, 4, 5] as const;
  const [open, setOpen] = useState<number>(0);

  return (
    <section id="faq" className="scroll-mt-24 bg-background px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto grid max-w-[1152px] gap-10 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
        <div>
          <p className="text-sm text-muted-foreground">{t("eyebrow")}</p>
          <h2 className="font-display mt-4 text-[32px] font-semibold leading-[1.08] text-foreground md:text-[36px]">
            {t("title")}
          </h2>
        </div>
        <div className="divide-y divide-border border-y border-border">
          {items.map((i) => {
            const expanded = open === i;
            return (
              <div key={i}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-1 py-5 text-start"
                  aria-expanded={expanded}
                  onClick={() => setOpen(expanded ? -1 : i)}
                >
                  <span className="font-display text-base font-medium text-foreground">
                    {t(`items.${i}.question`)}
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-4 shrink-0 text-muted-foreground transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                      expanded && "rotate-180",
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                    expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-[52ch] px-1 pb-5 text-[15px] leading-6 text-muted-foreground">
                      {t(`items.${i}.answer`)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
