"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, CheckCircle2, Clock3, LayoutGrid } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { HOME_ROUTE } from "@/lib/auth/config";
import { Button } from "@/components/ui/button";

function FloatingCard({
  className,
  children,
  delay = 0,
}: {
  className?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

function WorkloadPreview() {
  const t = useTranslations("home.hero.previews");
  return (
    <div className="w-[200px] rounded-2xl border border-border/80 bg-card p-4 shadow-lg shadow-foreground/5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{t("workload")}</p>
        <LayoutGrid className="size-3.5 text-primary" />
      </div>
      <div className="space-y-2">
        {[72, 45, 88].map((w, i) => (
          <div key={i} className="space-y-1">
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${w}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SchedulePreview() {
  const t = useTranslations("home.hero.previews");
  return (
    <div className="w-[180px] rounded-2xl border border-border/80 bg-card p-4 shadow-lg shadow-foreground/5">
      <div className="mb-3 flex items-center gap-2">
        <Clock3 className="size-3.5 text-accent" />
        <p className="text-xs font-medium">{t("schedule")}</p>
      </div>
      <div className="space-y-2">
        {["9:00", "11:30", "14:00"].map((time) => (
          <div
            key={time}
            className="flex items-center gap-2 rounded-lg bg-muted/70 px-2.5 py-1.5"
          >
            <span className="text-[10px] font-medium text-muted-foreground">
              {time}
            </span>
            <span className="h-1.5 flex-1 rounded-full bg-primary/30" />
          </div>
        ))}
      </div>
    </div>
  );
}

function TodoPreview() {
  const t = useTranslations("home.hero.previews");
  return (
    <div className="w-[190px] rounded-2xl border border-border/80 bg-card p-4 shadow-lg shadow-foreground/5">
      <p className="mb-3 text-xs font-medium">{t("todos")}</p>
      <ul className="space-y-2">
        {[true, true, false].map((done, i) => (
          <li key={i} className="flex items-center gap-2 text-xs">
            <CheckCircle2
              className={`size-3.5 shrink-0 ${done ? "text-primary" : "text-muted-foreground/40"}`}
            />
            <span className={done ? "text-muted-foreground line-through" : ""}>
              {t(`todo${i + 1}` as "todo1")}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BoardPreview() {
  const t = useTranslations("home.hero.previews");
  return (
    <div className="w-[220px] rounded-2xl border border-border/80 bg-card p-3 shadow-lg shadow-foreground/5">
      <p className="mb-2 px-1 text-xs font-medium text-muted-foreground">
        {t("board")}
      </p>
      <div className="grid grid-cols-3 gap-1.5">
        {["bg-secondary", "bg-primary/15", "bg-accent/15"].map((col, i) => (
          <div key={i} className="space-y-1.5 rounded-lg bg-muted/50 p-1.5">
            <div className={`h-8 rounded-md ${col}`} />
            <div className="h-5 rounded-md bg-background" />
            {i < 2 && <div className="h-5 rounded-md bg-background" />}
          </div>
        ))}
      </div>
    </div>
  );
}

export function LandingHero() {
  const t = useTranslations("home");
  const tCommon = useTranslations("common");
  const { isAuthenticated } = useAuth();
  const primaryHref = isAuthenticated ? HOME_ROUTE : "/register";
  const primaryLabel = isAuthenticated ? t("openBoards") : t("getDemo");

  return (
    <section className="relative overflow-hidden px-5 pb-16 pt-12 md:px-8 md:pb-24 md:pt-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-5%,_#99f6e455_0%,_transparent_55%),radial-gradient(ellipse_50%_40%_at_80%_20%,_#fdba7433_0%,_transparent_50%)] dark:bg-[radial-gradient(ellipse_70%_50%_at_50%_-5%,_#0f766e55_0%,_transparent_55%),radial-gradient(ellipse_50%_40%_at_80%_20%,_#c2410c33_0%,_transparent_50%)]"
      />

      {/* Floating product peeks */}
      <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden>
        <FloatingCard className="absolute left-[6%] top-[18%] -rotate-6" delay={0.25}>
          <WorkloadPreview />
        </FloatingCard>
        <FloatingCard className="absolute right-[7%] top-[14%] rotate-3" delay={0.35}>
          <SchedulePreview />
        </FloatingCard>
        <FloatingCard className="absolute bottom-[12%] left-[10%] rotate-2" delay={0.45}>
          <TodoPreview />
        </FloatingCard>
        <FloatingCard className="absolute bottom-[10%] right-[8%] -rotate-3" delay={0.55}>
          <BoardPreview />
        </FloatingCard>
      </div>

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.svg"
            alt=""
            width={56}
            height={56}
            className="mb-6 size-14 drop-shadow-sm"
          />
          <p className="mb-3 text-sm font-semibold tracking-wide text-primary">
            {tCommon("brand")}
          </p>
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            {t("headline")}
          </h1>
          <p className="mt-5 max-w-lg text-pretty text-base text-muted-foreground md:text-lg">
            {t("subtitle")}
          </p>
          <div className="mt-8">
            <Button asChild size="lg" className="h-11 px-8 text-base">
              <Link href={primaryHref}>
                {primaryLabel}
                <ArrowRight className="ms-1 size-4 rtl:rotate-180" />
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Mobile product peeks */}
        <motion.div
          className="mt-14 grid w-full max-w-md grid-cols-2 gap-3 lg:hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
        >
          <WorkloadPreview />
          <SchedulePreview />
          <TodoPreview />
          <BoardPreview />
        </motion.div>
      </div>
    </section>
  );
}
