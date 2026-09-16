"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { LocaleSwitcher, ThemeToggle } from "@/components/layout";

interface AuthShellProps {
  title: string;
  description: string;
  children: ReactNode;
}

/**
 * Centered auth form on a warm iris→rose atmosphere with brand as hero signal.
 */
export function AuthShell({ title, description, children }: AuthShellProps) {
  const t = useTranslations("common");

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#99f6e466_0%,_transparent_55%),radial-gradient(ellipse_at_bottom_right,_#fdba7444_0%,_transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top,_#0f766e66_0%,_transparent_55%),radial-gradient(ellipse_at_bottom_right,_#c2410c40_0%,_transparent_50%)]"
      />
      <div className="absolute top-4 end-4 z-10 flex items-center gap-1">
        <LocaleSwitcher />
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Link
            href="/"
            className="mb-6 flex flex-col items-center gap-3 outline-none transition-opacity duration-150 hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.svg"
              alt=""
              width={56}
              height={56}
              className="size-14"
            />
            <span className="text-2xl font-semibold tracking-tight text-foreground">
              {t("brand")}
            </span>
          </Link>
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="rounded-xl border border-border bg-card/80 p-6 shadow-sm backdrop-blur-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
