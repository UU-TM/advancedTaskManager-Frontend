"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  variant = "default",
  onRetry,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  variant?: "default" | "error";
  onRetry?: () => void;
}) {
  const t = useTranslations("common");
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-lg border border-border bg-card px-6 py-10 text-center",
        variant === "error" && "text-destructive",
        className,
      )}
      role={variant === "error" ? "alert" : undefined}
    >
      {Icon && (
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-md bg-muted text-muted-foreground",
            variant === "error" && "bg-destructive/10 text-destructive",
          )}
        >
          <Icon className="size-5" aria-hidden />
        </div>
      )}
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      {description && (
        <p className="max-w-xs text-sm text-muted-foreground">{description}</p>
      )}
      {(action || onRetry) && (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              {t("retry")}
            </Button>
          )}
          {action}
        </div>
      )}
    </div>
  );
}
