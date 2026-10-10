import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function WidgetShell({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "flex min-h-0 flex-col rounded-[18px] border border-border/80 bg-card p-6 text-card-foreground shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_24px_60px_-28px_rgba(0,0,0,0.28)]",
        className,
      )}
    >
      {children}
    </section>
  );
}
