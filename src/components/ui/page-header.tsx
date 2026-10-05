import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
  sticky = false,
  variant = "default",
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  eyebrow?: ReactNode;
  sticky?: boolean;
  variant?: "default" | "dashboard";
  className?: string;
}) {
  if (variant === "dashboard") {
    return (
      <div
        className={cn(
          "flex shrink-0 flex-wrap items-end justify-between gap-3 border-b border-border/40 px-4 pb-3 pt-5 md:px-6",
          className,
        )}
      >
        <div className="min-w-0">{title}</div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mb-8 flex flex-wrap items-end justify-between gap-4",
        sticky && "sticky top-0 z-20 -mx-4 bg-background/90 px-4 py-3 backdrop-blur-sm md:-mx-6 md:px-6",
        className,
      )}
    >
      <div className="space-y-1">
        {eyebrow && (
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {eyebrow}
          </p>
        )}
        <h1 className="text-[length:var(--text-title)] font-semibold tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions}
    </div>
  );
}
