"use client";

import type { ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { DashboardDateProvider } from "./dashboard-date-context";
import { ActiveWorkspaceProvider } from "./active-workspace-context";
import { CommandPaletteProvider } from "./command-palette";
import { useMeEvents } from "@/hooks/use-board-events";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

function MeEventsBridge() {
  const { isAuthenticated } = useAuth();
  useMeEvents(isAuthenticated);
  return null;
}

/**
 * Full-bleed authenticated frame with command palette and skip link.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const t = useTranslations("common");
  const isRtl = locale === "fa";

  return (
    <DashboardDateProvider>
      <ActiveWorkspaceProvider>
        <CommandPaletteProvider>
          <MeEventsBridge />
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none"
          >
            {t("skipToContent")}
          </a>
          <div className="flex h-dvh w-full overflow-hidden bg-dashboard-frame">
            <div className="flex h-full w-full overflow-hidden bg-background">
              <Sidebar />
              <div
                className={cn(
                  "flex min-h-0 min-w-0 flex-1 flex-col",
                  // Physical margins: sidebar uses left-0/right-0, not logical start.
                  // Logical me/ms under html[dir=rtl] put the gap on the wrong side.
                  isRtl ? "md:mr-[3.05rem]" : "md:ml-[3.05rem]",
                )}
              >
                <Header />
                <main
                  id="main-content"
                  className="min-h-0 min-w-0 flex-1 overflow-auto"
                >
                  {children}
                </main>
              </div>
            </div>
          </div>
        </CommandPaletteProvider>
      </ActiveWorkspaceProvider>
    </DashboardDateProvider>
  );
}
