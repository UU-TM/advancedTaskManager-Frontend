"use client";

import type { ComponentProps, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface AuthFieldProps extends Omit<ComponentProps<"input">, "id"> {
  id: string;
  label: string;
  icon: LucideIcon;
  error?: string;
  trailing?: ReactNode;
}

/**
 * Labeled auth input with a leading icon and field-level error.
 */
export function AuthField({
  id,
  label,
  icon: Icon,
  error,
  trailing,
  className,
  ...props
}: AuthFieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        {trailing}
      </div>
      <div className="relative">
        <Icon
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          id={id}
          {...props}
          aria-invalid={!!error}
          className={cn("pl-9", className)}
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
