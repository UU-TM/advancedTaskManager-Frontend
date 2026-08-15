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
        "flex h-full min-h-0 flex-col rounded-2xl border border-border/80 bg-card p-5",
        className,
      )}
      style={{ boxShadow: "var(--dashboard-widget-shadow)" }}
    >
      {children}
    </section>
  );
}
