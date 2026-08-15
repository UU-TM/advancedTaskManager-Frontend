"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Github } from "lucide-react";
import { motion } from "framer-motion";
import { useHome } from "@/hooks/use-home";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { WidgetShell } from "./widget-shell";
import { AnimatedNumber, useMotionSafe } from "./motion";

function Gauge({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const safe = useMotionSafe();
  const max = Math.max(value, 10);
  const pct = Math.min(1, value / max);
  const r = 28;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg viewBox="0 0 72 72" className="size-16">
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke="currentColor"
          className="text-muted"
          strokeWidth="6"
        />
        <motion.circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={safe ? { strokeDashoffset: c } : false}
          animate={{ strokeDashoffset: c * (1 - pct) }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          transform="rotate(-90 36 36)"
        />
      </svg>
      <AnimatedNumber value={value} className="text-lg font-bold" />
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  );
}

export function GithubSummaryWidget() {
  const t = useTranslations("dashboard.pack.github");
  const { data, isLoading } = useHome();
  const gh = data?.githubSummary;

  return (
    <WidgetShell>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <Github className="size-4" />
          {t("title")}
        </h2>
        {gh?.connected && (
          <Badge variant="default">{t("connected")}</Badge>
        )}
      </div>
      {isLoading && <Skeleton className="h-20 w-full" />}
      {!isLoading && !gh?.connected && (
        <EmptyState
          icon={Github}
          title={t("emptyTitle")}
          description={t("emptyDescription")}
          action={
            <Button asChild size="sm" variant="outline">
              <Link href="/integrations">{t("emptyAction")}</Link>
            </Button>
          }
        />
      )}
      {gh?.connected && (
        <div className="flex items-center justify-around">
          <Gauge label={t("issues")} value={gh.openIssues} color="#f97316" />
          <Gauge label={t("prs")} value={gh.openPrs} color="#3b82f6" />
        </div>
      )}
      {gh?.connected && (
        <Link
          href="/integrations"
          className="mt-3 block text-center text-xs font-medium text-dashboard-accent transition-opacity hover:opacity-80"
        >
          {t("manage")}
        </Link>
      )}
    </WidgetShell>
  );
}
