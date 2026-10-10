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
          "flex shrink-0 flex-wrap items-end justify-between gap-3 border-b border-border/60 bg-card px-4 pb-3 pt-5 md:px-6",
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
        sticky && "sticky top-0 z-20 bg-background py-3",
        className,
      )}
    >
      <div className="min-w-0 space-y-1">
        {eyebrow && <p className="text-sm text-muted-foreground">{eyebrow}</p>}
        <h1 className="font-display text-[32px] font-semibold leading-[1.05] tracking-[-0.03em] text-foreground">
          {title}
        </h1>
        {description && (
          <p className="max-w-[65ch] text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions}
    </div>
  );
}
