import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const sizes = {
  sm: "max-w-2xl",
  md: "max-w-3xl",
  lg: "max-w-4xl",
  xl: "max-w-5xl",
  "2xl": "max-w-6xl",
} as const;

export function PageContainer({
  size = "lg",
  className,
  children,
}: {
  size?: keyof typeof sizes;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 py-6 md:px-6",
        sizes[size],
        className,
      )}
    >
      {children}
    </div>
  );
}
