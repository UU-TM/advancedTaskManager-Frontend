"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/use-auth";
import { HOME_ROUTE } from "@/lib/auth/config";

export function LandingCta() {
  const t = useTranslations("home.cta");
  const tHome = useTranslations("home");
  const { isAuthenticated } = useAuth();
  const href = isAuthenticated ? HOME_ROUTE : "/register";
  const label = isAuthenticated ? tHome("openBoards") : t("button");

  return (
    <section className="bg-background px-4 py-8 md:px-5 md:py-10">
      <div className="mx-auto flex min-h-[420px] max-w-[1152px] flex-col items-center justify-center rounded-3xl bg-[#357dff] px-6 py-20 text-center text-white md:min-h-[464px]">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/80">
          {t("note")}
        </p>
        <h2 className="font-display mt-5 max-w-[18ch] text-[32px] font-semibold leading-[1.05] md:text-[36px] md:leading-[37.8px]">
          {t("title")}
        </h2>
        <p className="mt-4 max-w-[36rem] text-[15px] leading-6 text-white/80">
          {isAuthenticated ? tHome("subtitle") : t("subtitle")}
        </p>
        <Link
          href={href}
          className="mt-8 inline-flex h-12 items-center rounded-full bg-white px-7 text-sm font-semibold text-[#0a0a0a] transition-[transform,background-color] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#f4f4f5] active:scale-[0.98]"
        >
          {label}
        </Link>
      </div>
    </section>
  );
}
