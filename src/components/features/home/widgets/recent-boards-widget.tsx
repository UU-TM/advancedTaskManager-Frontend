"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { History } from "lucide-react";
import { useHome } from "@/hooks/use-home";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { WidgetShell } from "./widget-shell";
import { useMotionSafe } from "./motion";

export function RecentBoardsWidget() {
  const t = useTranslations("dashboard.pack.recentBoards");
  const { data, isLoading } = useHome();
  const safe = useMotionSafe();
  const boards = (data?.recentBoards ?? []).slice(0, 4);

  return (
    <WidgetShell>
      <h2 className="mb-4 text-base font-semibold">{t("title")}</h2>
      {isLoading && <Skeleton className="h-24 w-full" />}
      {!isLoading && boards.length === 0 && (
        <EmptyState
          icon={History}
          title={t("emptyTitle")}
          description={t("emptyDescription")}
          action={
            <Button asChild size="sm" variant="outline">
              <Link href="/boards">{t("emptyAction")}</Link>
            </Button>
          }
        />
      )}
      {boards.length > 0 && (
      <div className="relative mx-auto h-28 w-full max-w-xs">
        {boards.map((board, i) => (
          <motion.div
            key={board.id}
            className="absolute inset-x-4"
            style={{ top: i * 14 }}
            initial={safe ? { y: 12, opacity: 0 } : false}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.07 }}
            whileHover={safe ? { y: -4, scale: 1.02, zIndex: 20 } : undefined}
          >
            <Link
              href={`/boards/${board.id}`}
              className="block rounded-2xl border bg-gradient-to-br from-card to-muted/40 px-4 py-3 shadow-sm transition-shadow hover:shadow-md"
            >
              <p className="truncate text-sm font-semibold">{board.name}</p>
              <p className="text-[11px] text-muted-foreground">
                {t("layer", { n: i + 1 })}
              </p>
            </Link>
          </motion.div>
        ))}
      </div>
      )}
    </WidgetShell>
  );
}
