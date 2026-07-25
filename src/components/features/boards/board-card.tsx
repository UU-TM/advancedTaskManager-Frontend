"use client";

import Link from "next/link";
import { Star } from "lucide-react";
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
  const done = cards.filter((c) => !!c.completedAt).length;
  return Math.round((done / cards.length) * 100);
}

interface BoardCardProps {
  board: Board;
  favorite: boolean;
  onToggleFavorite: (boardId: string) => void;
  member?: User | null;
}

export function BoardCard({
  board,
  favorite,
  onToggleFavorite,
  member,
}: BoardCardProps) {
  const progress = boardProgressPercent(board);
  const memberName = member?.displayName ?? member?.username ?? "?";

  return (
    <div className="group relative rounded-xl border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md">
      <Link
        href={`/boards/${board.id}`}
        className="block p-5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="mb-4 flex items-start justify-between gap-2 pr-8">
          <h3 className="line-clamp-2 text-base font-semibold leading-snug">
            {board.name}
          </h3>
        </div>

        <div className="space-y-2">
          <Progress
            value={progress}
            className="h-1.5 bg-secondary/30 [&>[data-slot=progress-indicator]]:bg-gradient-to-r [&>[data-slot=progress-indicator]]:from-secondary [&>[data-slot=progress-indicator]]:to-primary"
          />
          <p className="text-xs text-muted-foreground">Recent activity</p>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            {progress}% complete
          </span>
          <Avatar className="size-7 border border-border">
            <AvatarImage src={member?.avatarUrl} alt={memberName} />
            <AvatarFallback className="text-[10px]">
              {initials(memberName)}
            </AvatarFallback>
          </Avatar>
        </div>
      </Link>

      <button
        type="button"
        aria-label={favorite ? "Unfavorite board" : "Favorite board"}
        aria-pressed={favorite}
        className={cn(
          "absolute top-4 right-4 rounded-md p-1.5 transition-colors",
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
    </div>
  );
}
