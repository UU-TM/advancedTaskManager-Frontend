"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { LayoutGrid } from "lucide-react";
import { useActiveWorkspace } from "@/components/layout/active-workspace-context";
import { useBoards } from "@/hooks/use-boards";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { WidgetShell } from "./widget-shell";
import { useMotionSafe } from "./motion";

const TILE = [
  "from-primary/25 to-primary/5",
  "from-accent/25 to-accent/5",
  "from-info/25 to-info/5",
  "from-violet-500/25 to-violet-500/5",
  "from-amber-500/25 to-amber-500/5",
  "from-success/25 to-success/5",
];

export function MyBoardsWidget() {
  const t = useTranslations("dashboard.pack.myBoards");
  const { workspaceId } = useActiveWorkspace();
  const { data: boards = [], isLoading } = useBoards(workspaceId);
  const safe = useMotionSafe();

  return (
    <WidgetShell>
      <h2 className="mb-3 text-base font-semibold">{t("title")}</h2>
      {isLoading && <Skeleton className="h-28 w-full" />}
      {!isLoading && boards.length === 0 && (
        <EmptyState
          icon={LayoutGrid}
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
      <div className="grid grid-cols-2 gap-2">
        {boards.slice(0, 6).map((board, i) => (
          <motion.div
            key={board.id}
            initial={safe ? { opacity: 0, scale: 0.94 } : false}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            whileHover={safe ? { scale: 1.03 } : undefined}
            whileTap={safe ? { scale: 0.98 } : undefined}
          >
            <Link
              href={`/boards/${board.id}`}
              className={`block rounded-xl border bg-gradient-to-br p-3 ${TILE[i % TILE.length]}`}
            >
              <p className="truncate text-sm font-semibold">{board.name}</p>
            </Link>
          </motion.div>
        ))}
      </div>
      )}
    </WidgetShell>
  );
}
