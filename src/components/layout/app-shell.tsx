"use client";

import type { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

/**
 * AppShell
 * ----------------------------------------------------
 * The persistent app frame: sidebar on the left, sticky
 * header on top, content area in the middle. Use this
 * to wrap authenticated pages.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <Header />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
