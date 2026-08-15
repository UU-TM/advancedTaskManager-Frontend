"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useHome } from "@/hooks/use-home";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { WidgetShell } from "./widget-shell";
import { useMotionSafe } from "./motion";

const OFFSETS = [
  { x: "8%", y: "18%" },
  { x: "55%", y: "12%" },
  { x: "28%", y: "48%" },
  { x: "68%", y: "52%" },
  { x: "18%", y: "72%" },
  { x: "72%", y: "78%" },
];

export function StarredBoardsWidget() {
  const t = useTranslations("dashboard.pack.starredBoards");
  const { data, isLoading } = useHome();
  const safe = useMotionSafe();
  const boards = (data?.starredBoards ?? []).slice(0, 6);

  return (
    <WidgetShell className="relative overflow-hidden">
      <h2 className="relative z-10 mb-2 text-base font-semibold">{t("title")}</h2>
      {isLoading && <Skeleton className="h-24 w-full" />}
      {!isLoading && boards.length === 0 && (
        <EmptyState
          icon={Star}
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
      <div className="relative min-h-[7.5rem]">
        {boards.map((board, i) => {
          const pos = OFFSETS[i % OFFSETS.length]!;
          return (
            <motion.div
              key={board.id}
              className="absolute"
              style={{ left: pos.x, top: pos.y }}
              initial={safe ? { opacity: 0, scale: 0.8 } : false}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06, duration: 0.28 }}
              whileHover={safe ? { scale: 1.06, zIndex: 10 } : undefined}
            >
              <Link
                href={`/boards/${board.id}`}
                className="flex items-center gap-1.5 rounded-full border border-border/80 bg-card/90 px-2.5 py-1 text-xs font-medium shadow-sm backdrop-blur transition-shadow hover:shadow-md"
              >
                <Star className="size-3 fill-amber-400 text-amber-400" />
                <span className="max-w-[7rem] truncate">{board.name}</span>
              </Link>
            </motion.div>
          );
        })}
      </div>
      )}
    </WidgetShell>
  );
}
