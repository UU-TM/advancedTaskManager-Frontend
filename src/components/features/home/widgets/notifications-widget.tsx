"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Bell } from "lucide-react";
import {
  useMarkNotificationRead,
  useNotifications,
} from "@/hooks/use-notifications";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { WidgetShell } from "./widget-shell";
import { MotionItem, MotionList, useMotionSafe } from "./motion";
import { cn } from "@/lib/utils";

export function NotificationsWidget() {
  const t = useTranslations("dashboard.pack.notifications");
  const router = useRouter();
  const { data = [], isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const safe = useMotionSafe();
  const items = data.slice(0, 6);
  const unread = data.filter((n) => !n.readAt).length;

  return (
    <WidgetShell>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold">{t("title")}</h2>
        {unread > 0 && (
          <motion.span
            className="rounded-full bg-dashboard-accent px-2 py-0.5 text-[10px] font-bold text-white"
            animate={safe ? { scale: [1, 1.08, 1] } : undefined}
            transition={{ duration: 1.8, repeat: Infinity }}
          >
            {unread}
          </motion.span>
        )}
      </div>
      {isLoading && <Skeleton className="h-24 w-full" />}
      {!isLoading && items.length === 0 && (
        <EmptyState
          icon={Bell}
          title={t("emptyTitle")}
          description={t("emptyDescription")}
        />
      )}
      {items.length > 0 && (
      <MotionList className="space-y-1">
        {items.map((n) => (
          <MotionItem key={n.id}>
            <button
              type="button"
              className={cn(
                "flex w-full cursor-pointer flex-col rounded-xl px-3 py-2 text-start transition-colors hover:bg-muted/60",
                !n.readAt && "bg-dashboard-accent/5",
              )}
              onClick={() => {
                void markRead.mutateAsync(n.id);
                if (n.href) router.push(n.href);
              }}
            >
              <span className="truncate text-sm font-medium">{n.title}</span>
              <span className="truncate text-xs text-muted-foreground">
                {n.body}
              </span>
            </button>
          </MotionItem>
        ))}
      </MotionList>
      )}
    </WidgetShell>
  );
}
