"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutTemplate, Trello } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: typeof Trello;
  placeholder?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "My Boards", href: "/boards", icon: Trello },
  { label: "Templates", href: "#", icon: LayoutTemplate, placeholder: true },
  { label: "Home", href: "#", icon: Home, placeholder: true },
];

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

interface SidebarNavProps {
  onNavigate?: () => void;
  className?: string;
}

/**
 * Shared sidebar navigation content (desktop aside + mobile sheet).
 */
export function SidebarNav({ onNavigate, className }: SidebarNavProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const displayName = user?.displayName ?? user?.username ?? "Guest";

  return (
    <div className={cn("flex h-full flex-col bg-sidebar text-sidebar-foreground", className)}>
      <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-4">
        <Avatar className="size-10 border border-sidebar-border">
          <AvatarImage src={user?.avatarUrl} alt={displayName} />
          <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground">
            {initials(displayName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight">{displayName}</p>
          {user?.username && (
            <p className="truncate text-[11px] text-muted-foreground">@{user.username}</p>
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const active =
            !item.placeholder &&
            (pathname === item.href || pathname.startsWith(`${item.href}/`));
          const Icon = item.icon;

          if (item.placeholder) {
            return (
              <span
                key={item.label}
                className="flex cursor-not-allowed items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/50"
                aria-disabled
              >
                <Icon className="size-4" />
                {item.label}
              </span>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center justify-between border-t border-sidebar-border px-5 py-4">
        <span className="text-[11px] text-muted-foreground">Theme</span>
        <ThemeToggle />
      </div>
    </div>
  );
}

/**
 * Desktop sticky sidebar.
 */
export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-sidebar-border md:flex">
      <SidebarNav className="w-full" />
    </aside>
  );
}
