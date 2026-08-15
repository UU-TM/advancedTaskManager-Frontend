"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import type { Board, User } from "@/types/domain";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

/** Progress from card completion when cards are present; otherwise 0. */
export function boardProgressPercent(board: Board): number {
  const cards = board.cards ?? [];
  if (cards.length === 0) return 0;
  const done = cards.filter((c) => !!c.archivedAt).length;
  return Math.round((done / cards.length) * 100);
}

interface BoardCardProps {
  board: Board;
  favorite: boolean;
  onToggleFavorite: (boardId: string) => void;
  member?: User | null;
  index?: number;
}

export function BoardCard({
  board,
  favorite,
  onToggleFavorite,
  member,
  index = 0,
}: BoardCardProps) {
  const t = useTranslations("boards");
  const tCommon = useTranslations("common");
  const progress = boardProgressPercent(board);
  const memberName = member?.displayName ?? member?.username ?? "?";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.04, 0.24), ease: "easeOut" }}
      className="group relative rounded-xl border border-border bg-card text-card-foreground transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md active:translate-y-0 active:scale-[0.99]"
    >
      <Link
        href={`/boards/${board.id}`}
        className="block cursor-pointer p-5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="mb-4 flex items-start justify-between gap-2 pe-8">
          <h3 className="line-clamp-2 text-base font-semibold leading-snug">
            {board.name}
          </h3>
        </div>

        <div className="space-y-2">
          <Progress
            value={progress}
            className="h-1.5 bg-muted [&>[data-slot=progress-indicator]]:bg-primary"
          />
          <p className="text-xs text-muted-foreground">{t("recentActivity")}</p>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs tabular-nums text-muted-foreground">
            {tCommon("percentArchived", { percent: progress })}
          </span>
          <Avatar className="size-7 border border-border">
            <AvatarImage
              src={member?.avatarUrl ?? undefined}
              alt={memberName}
            />
            <AvatarFallback className="text-[10px]">
              {initials(memberName)}
            </AvatarFallback>
          </Avatar>
        </div>
      </Link>

      <button
        type="button"
        aria-label={favorite ? t("unfavorite") : t("favorite")}
        aria-pressed={favorite}
        className={cn(
          "absolute top-3 end-3 flex size-11 min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-md transition-colors duration-150",
          favorite
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground",
        )}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggleFavorite(board.id);
        }}
      >
        <Star
          className={cn("size-4", favorite && "fill-current")}
          aria-hidden
        />
      </button>
    </motion.div>
  );
}
