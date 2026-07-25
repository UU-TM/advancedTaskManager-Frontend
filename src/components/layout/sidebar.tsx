"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Trello,
  Users,
  Settings,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutGrid;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Boards", href: "/boards", icon: Trello },
  { label: "Workspace", href: "/workspace", icon: Users },
  { label: "Dashboard", href: "/dev/components", icon: LayoutGrid },
  { label: "Settings", href: "/settings", icon: Settings },
];

/**
 * Sidebar
 * ----------------------------------------------------
 * Sticky left navigation. Each item highlights when
 * its route is active. The header above the nav list
 * is the brand mark + product name.
 */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex h-screen w-60 flex-col border-r bg-sidebar text-sidebar-foreground sticky top-0">
      <div className="flex items-center gap-2 px-5 h-16 border-b border-sidebar-border">
        <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Sparkles className="size-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold leading-tight">Kanban</span>
          <span className="text-[10px] text-muted-foreground">Alucard × Dracula</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-sidebar-border text-[11px] text-muted-foreground">
        v0.1.0 · scaffold
      </div>
    </aside>
  );
}
