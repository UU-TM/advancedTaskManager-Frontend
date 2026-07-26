"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LocaleSwitcher, ThemeToggle } from "@/components/layout";

export default function HomePage() {
  const t = useTranslations("home");
  const tCommon = useTranslations("common");
  const { isAuthenticated } = useAuth();
  const primaryHref = isAuthenticated ? "/boards" : "/login";
  const primaryLabel = isAuthenticated ? t("openBoards") : t("getStarted");

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,_#ccfbf1aa_0%,_transparent_60%)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,_#134e4a88_0%,_transparent_60%)]"
      />

      <header className="relative z-10 flex items-center justify-between px-5 py-4 md:px-10">
        <Link
          href="/"
          className="flex items-center gap-2.5 outline-none transition-opacity duration-150 hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" width={32} height={32} className="size-8" />
          <span className="text-lg font-semibold tracking-tight">
            {tCommon("brand")}
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <ThemeToggle />
          {!isAuthenticated && (
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">{t("signIn")}</Link>
            </Button>
          )}
        </div>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 pb-20 pt-8 text-center md:px-10">
        <motion.div
          className="mx-auto max-w-xl space-y-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <p className="text-sm font-medium text-primary">{tCommon("brand")}</p>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            {t("headline")}
          </h1>
          <p className="text-base text-muted-foreground md:text-lg">
            {t("subtitle")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button asChild size="lg" className="cursor-pointer">
              <Link href={primaryHref}>
                {primaryLabel}
                <ArrowRight className="ms-2 size-4 rtl:rotate-180" />
              </Link>
            </Button>
            {!isAuthenticated && (
              <Button asChild size="lg" variant="outline" className="cursor-pointer">
                <Link href="/register">{t("createAccount")}</Link>
              </Button>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
