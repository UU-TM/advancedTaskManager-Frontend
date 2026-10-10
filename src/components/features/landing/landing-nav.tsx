"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { HOME_ROUTE } from "@/lib/auth/config";
import { LocaleSwitcher, ThemeToggle } from "@/components/layout";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#product", key: "solutions" },
  { href: "#features", key: "features" },
  { href: "#how-it-works", key: "how" },
  { href: "#pricing", key: "pricing" },
  { href: "#faq", key: "faq" },
] as const;

export function LandingNav() {
  const t = useTranslations("home");
  const tCommon = useTranslations("common");
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const ctaHref = isAuthenticated ? HOME_ROUTE : "/login";
  const ctaLabel = isAuthenticated ? t("openBoards") : t("signIn");

  return (
    <header className="sticky top-2 z-50 px-4 md:px-5">
      <nav
        aria-label={tCommon("brand")}
        className="mx-auto flex h-12 max-w-[1152px] items-center gap-2 rounded-3xl bg-background/85 px-1 shadow-[0_10px_40px_-24px_rgba(10,10,10,0.45)] backdrop-blur-md dark:shadow-[0_10px_40px_-24px_rgba(0,0,0,0.7)]"
      >
        <Link
          href="/"
          className="inline-flex h-10 items-center gap-2 rounded-[14px] px-2.5 outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-[#357dff]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" width={24} height={24} className="size-6" />
          <span className="text-base font-bold tracking-tight text-foreground">
            {tCommon("brand")}
          </span>
        </Link>

        <div className="mx-auto hidden items-center lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="flex h-10 items-center rounded-full px-2.5 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
            >
              {t(`nav.${link.key}`)}
            </a>
          ))}
        </div>

        <div className="ms-auto flex items-center gap-1">
          <div className="hidden items-center sm:flex">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
          <Link
            href={ctaHref}
            className="inline-flex h-9 items-center rounded-full bg-[#357dff] px-4 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] transition-[background-color,transform] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#2a6ef0] active:scale-[0.98]"
          >
            {ctaLabel}
          </Link>
          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-full text-foreground lg:hidden"
            aria-expanded={open}
            aria-label={open ? t("nav.closeMenu") : t("nav.openMenu")}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      <div
        className={cn(
          "mx-auto mt-2 max-w-[1152px] overflow-hidden rounded-3xl bg-background/95 shadow-[0_16px_40px_-24px_rgba(10,10,10,0.4)] backdrop-blur-md transition-[max-height,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:hidden",
          open ? "max-h-80 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="flex flex-col p-3">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-2.5 text-sm font-medium text-foreground"
              onClick={() => setOpen(false)}
            >
              {t(`nav.${link.key}`)}
            </a>
          ))}
          <div className="flex items-center gap-1 px-2 pt-2 sm:hidden">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
