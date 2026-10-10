"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Box, Clock, Megaphone, Plus, Rocket } from "lucide-react";
import { useHome } from "@/hooks/use-home";
import { useActiveWorkspace } from "./active-workspace-context";
import { WorkspaceSwitcher } from "./workspace-switcher";
import {
  APP_NAV_GENERAL,
  APP_NAV_INSIGHTS,
  APP_NAV_MORE,
  APP_NAV_PLANNING,
  isNavActive,
  type AppNavItemDef,
} from "./app-nav";
import { HOME_ROUTE } from "@/lib/auth/config";
import { CreateBoardDialog } from "@/components/features/boards/create-board-dialog";
import { SessionNavBar } from "@/components/ui/session-nav-bar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const WORKSPACE_ICONS = [Clock, Megaphone, Box, Rocket] as const;

interface SidebarNavProps {
  onNavigate?: () => void;
  className?: string;
}

/**
 * Shared sidebar navigation content (mobile sheet).
 * Desktop uses SessionNavBar.
 */
export function SidebarNav({ onNavigate, className }: SidebarNavProps) {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const { data: home } = useHome();
  const { workspaceId } = useActiveWorkspace();
  const assignedCount =
    home?.assignedCards.filter((c) => !c.archivedAt).length ?? 0;

  const workspaceBoards = [
    ...(home?.starredBoards ?? []),
    ...(home?.recentBoards ?? []).filter(
      (b) => !(home?.starredBoards ?? []).some((s) => s.id === b.id),
    ),
  ].slice(0, 6);

  function toItems(defs: AppNavItemDef[]) {
    return defs.map((def) => ({
      label: t(def.labelKey),
      href: def.href,
      icon: def.icon,
      badge:
        def.boardsBadge && assignedCount > 0 ? assignedCount : undefined,
    }));
  }

  const sections = [
    { title: t("general"), items: toItems(APP_NAV_GENERAL) },
    { title: t("insights"), items: toItems(APP_NAV_INSIGHTS) },
    { title: t("planning"), items: toItems(APP_NAV_PLANNING) },
    { title: t("more"), items: toItems(APP_NAV_MORE) },
  ];

  function renderNav(
    items: {
      label: string;
      href: string;
      icon: AppNavItemDef["icon"];
      badge?: number;
    }[],
  ) {
    return items.map((item) => {
      const active = isNavActive(pathname, item.href);
      const Icon = item.icon;

      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          aria-current={active ? "page" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-sidebar-ring",
            active
              ? "bg-sidebar-accent font-medium text-foreground"
              : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          )}
        >
          <Icon className="size-4 shrink-0" />
          <span className="min-w-0 flex-1 truncate">{item.label}</span>
          {item.badge != null && (
            <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-semibold text-muted-foreground">
              {item.badge}
            </span>
          )}
        </Link>
      );
    });
  }

  return (
    <div
      className={cn(
        "flex h-full flex-col bg-sidebar text-sidebar-foreground backdrop-blur-xl",
        className,
      )}
    >
      <div className="space-y-3 px-4 py-4">
        <Link
          href={HOME_ROUTE}
          onClick={onNavigate}
          className="flex items-center gap-2.5 outline-none transition-opacity duration-150 hover:opacity-80 focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt={tCommon("brand")} width={28} height={28} className="size-7" />
          <span className="text-base font-semibold">
            {tCommon("brand")}
          </span>
        </Link>

        <WorkspaceSwitcher />

        {workspaceId ? (
          <CreateBoardDialog
            workspaceId={workspaceId}
            trigger={
              <Button
                className="h-9 w-full cursor-pointer justify-start gap-2 font-medium"
              >
                <Plus className="size-4" />
                {t("create")}
              </Button>
            }
          />
        ) : (
          <Button
            variant="outline"
            disabled
            className="h-9 w-full justify-start gap-2"
          >
            <Plus className="size-4" />
            {t("create")}
          </Button>
        )}
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-2.5 pb-4">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {section.title}
            </p>
            <div className="space-y-0.5">{renderNav(section.items)}</div>
          </div>
        ))}

        {workspaceBoards.length > 0 && (
          <div>
            <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t("myWorkspace")}
            </p>
            <div className="space-y-0.5">
              {workspaceBoards.map((board, index) => {
                const Icon = WORKSPACE_ICONS[index % WORKSPACE_ICONS.length]!;
                const active = pathname.startsWith(`/boards/${board.id}`);
                return (
                  <Link
                    key={board.id}
                    href={`/boards/${board.id}`}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors duration-150",
                      active
                        ? "bg-sidebar-accent font-medium text-foreground"
                        : "text-muted-foreground hover:bg-sidebar-accent",
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-3.5 shrink-0",
                        active ? "text-foreground" : "text-muted-foreground",
                      )}
                    />
                    <span className="truncate">{board.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}

/**
 * Desktop collapsible session sidebar (hover to expand).
 * Mobile navigation stays in the header sheet via `SidebarNav`.
 */
export function Sidebar() {
  return <SessionNavBar />;
}
