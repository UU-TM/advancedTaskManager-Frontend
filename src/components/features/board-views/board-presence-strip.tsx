"use client";

import { useTranslations } from "next-intl";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useBoardPresence } from "@/hooks/use-presence";

export function BoardPresenceStrip({ boardId }: { boardId: string }) {
  const t = useTranslations("presence");
  const { data } = useBoardPresence(boardId);
  const users = data?.presence ?? [];

  if (users.length === 0) return null;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center gap-1" aria-label={t("label")}>
        <div className="flex -space-x-2 rtl:space-x-reverse">
          {users.slice(0, 6).map((u) => (
            <Tooltip key={u.userId}>
              <TooltipTrigger asChild>
                <Avatar className="size-7 border-2 border-background ring-1 ring-border">
                  <AvatarFallback className="text-[9px]">
                    {u.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>{u.username}</TooltipContent>
            </Tooltip>
          ))}
        </div>
        {users.length > 6 && (
          <span className="text-xs text-muted-foreground">
            +{users.length - 6}
          </span>
        )}
      </div>
    </TooltipProvider>
  );
}
