"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Box,
  Building2,
  Clock,
  Home,
  LayoutTemplate,
  Mail,
  Megaphone,
  Plug,
  Plus,
  Rocket,
  Settings,
  Trello,
} from "lucide-react";
import { useHome } from "@/hooks/use-home";
import { useActiveWorkspace } from "./active-workspace-context";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { HOME_ROUTE } from "@/lib/auth/config";
import { CreateBoardDialog } from "@/components/features/boards/create-board-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const WORKSPACE_ICONS = [Clock, Megaphone, Box, Rocket] as const;

interface SidebarNavProps {
  onNavigate?: () => void;
  className?: string;
}

/**
 * Shared sidebar navigation content (desktop aside + mobile sheet).
 * Profile + theme live in the header user menu.
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

  const navItems = [
    { label: t("home"), href: "/home", icon: Home },
    {
      label: t("myBoards"),
      href: "/boards",
      icon: Trello,
      badge: assignedCount > 0 ? assignedCount : undefined,
    },
    { label: t("templates"), href: "/templates", icon: LayoutTemplate },
    { label: t("workspace"), href: "/workspace", icon: Building2 },
    { label: t("invitations"), href: "/invitations", icon: Mail },
    { label: t("integrations"), href: "/integrations", icon: Plug },
    { label: t("settings"), href: "/settings", icon: Settings },
  ] as const;

  return (
    <div
      className={cn(
        "flex h-full flex-col bg-sidebar text-sidebar-foreground",
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
          <span className="text-base font-semibold tracking-tight">
            {tCommon("brand")}
          </span>
        </Link>

        <WorkspaceSwitcher />

        {workspaceId ? (
          <CreateBoardDialog
            workspaceId={workspaceId}
            trigger={
              <Button
                className="h-10 w-full cursor-pointer justify-start gap-2 rounded-xl font-medium shadow-sm shadow-primary/20 transition-transform duration-150 hover:scale-[1.01] active:scale-[0.99]"
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
            className="h-10 w-full justify-start gap-2 rounded-xl"
          >
            <Plus className="size-4" />
            {t("create")}
          </Button>
        )}
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-2.5 pb-4">
        <div>
          <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("general")}
          </p>
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              const badge = "badge" in item ? item.badge : undefined;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-150",
                    active
                      ? "bg-primary/12 font-medium text-primary shadow-sm shadow-primary/10"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {badge != null && (
                    <span className="rounded-md bg-primary/15 px-1.5 py-0.5 text-xs font-semibold text-primary">
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

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
                      "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-150",
                      active
                        ? "bg-primary/12 font-medium text-primary"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/70",
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-3.5 shrink-0",
                        active ? "text-primary" : "text-muted-foreground",
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
 * Desktop sticky sidebar.
 */
export function Sidebar() {
  return (
    <aside className="hidden h-full w-60 shrink-0 border-e border-sidebar-border md:flex">
      <SidebarNav className="w-full" />
    </aside>
  );
}
