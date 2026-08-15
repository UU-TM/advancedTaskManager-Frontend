"use client";

import type { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { DashboardDateProvider } from "./dashboard-date-context";
import { ActiveWorkspaceProvider } from "./active-workspace-context";
import { CommandPaletteProvider } from "./command-palette";

/**
 * Full-bleed authenticated frame with command palette and skip link.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <DashboardDateProvider>
      <ActiveWorkspaceProvider>
        <CommandPaletteProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none"
          >
            Skip to main content
          </a>
          <div className="flex h-dvh w-full overflow-hidden bg-dashboard-frame">
            <div className="flex h-full w-full overflow-hidden bg-background">
              <Sidebar />
              <div className="flex min-h-0 min-w-0 flex-1 flex-col">
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
