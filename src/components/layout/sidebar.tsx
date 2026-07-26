"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Home, LayoutTemplate, Trello } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";

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
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const { user } = useAuth();
  const displayName = user?.displayName ?? user?.username ?? tCommon("guest");

  const navItems = [
    { label: t("myBoards"), href: "/boards", icon: Trello },
    {
      label: t("templates"),
      href: "#",
      icon: LayoutTemplate,
      placeholder: true,
    },
    { label: t("home"), href: "#", icon: Home, placeholder: true },
  ] as const;

  return (
    <div
      className={cn(
        "flex h-full flex-col bg-sidebar text-sidebar-foreground",
        className,
      )}
    >
      <div className="border-b border-sidebar-border px-4 py-4">
        <Link
          href="/boards"
          onClick={onNavigate}
          className="flex items-center gap-2.5 outline-none transition-opacity duration-150 hover:opacity-80 focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" width={28} height={28} className="size-7" />
          <span className="text-base font-semibold tracking-tight">
            {tCommon("brand")}
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 px-2.5 py-3">
        {navItems.map((item) => {
          const active =
            !("placeholder" in item && item.placeholder) &&
            (pathname === item.href || pathname.startsWith(`${item.href}/`));
          const Icon = item.icon;
          const isPlaceholder = "placeholder" in item && item.placeholder;

          if (isPlaceholder) {
            return (
              <span
                key={item.label}
                className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/40"
                aria-disabled
              >
                <Icon className="size-4 shrink-0" />
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
                "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-150",
                active
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
              )}
            >
              {active && (
                <span
                  aria-hidden
                  className="absolute inset-y-1.5 start-0 w-0.5 rounded-full bg-sidebar-primary transition-colors duration-150"
                />
              )}
              <Icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <Avatar className="size-8 border border-sidebar-border">
            <AvatarImage src={user?.avatarUrl} alt={displayName} />
            <AvatarFallback className="bg-sidebar-accent text-xs text-sidebar-accent-foreground">
              {initials(displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium leading-tight">
              {displayName}
            </p>
            {user?.username && (
              <p className="truncate text-xs text-muted-foreground">
                @{user.username}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between px-4 pb-3">
          <span className="text-xs text-muted-foreground">{tCommon("theme")}</span>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}

/**
 * Desktop sticky sidebar.
 */
export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-dvh w-56 shrink-0 border-e border-sidebar-border md:flex">
      <SidebarNav className="w-full" />
    </aside>
  );
}
