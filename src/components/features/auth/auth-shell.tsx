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

export function AuthShell({ title, description, children }: AuthShellProps) {
  const t = useTranslations("common");

  return (
    <div className="waymark-wash font-waymark relative flex min-h-dvh flex-col items-center justify-center px-4 py-10 text-foreground">
      <div className="absolute top-4 end-4 z-10 flex items-center gap-1">
        <LocaleSwitcher />
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm">
        <div className="mb-8">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 rounded-md outline-none transition-opacity duration-150 hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.svg"
              alt=""
              width={28}
              height={28}
              className="size-7"
            />
            <span className="text-base font-semibold tracking-tight text-foreground">
              {t("brand")}
            </span>
          </Link>
          <h1 className="font-display text-[32px] font-semibold leading-[1.05] tracking-[-0.03em]">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="rounded-[18px] border border-border bg-card p-6 text-card-foreground shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_24px_60px_-28px_rgba(0,0,0,0.28)]">
          {children}
        </div>
      </div>
    </div>
  );
}
