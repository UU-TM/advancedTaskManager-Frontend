"use client";

import type { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

/**
 * AppShell
 * ----------------------------------------------------
 * Persistent authenticated frame: dark sidebar + header
 * + main content. Sidebar collapses to a Sheet on mobile.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
