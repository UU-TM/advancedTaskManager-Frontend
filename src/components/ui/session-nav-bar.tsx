"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { motion, type Transition } from "framer-motion";
import { LogOut, Mail, Pin, Plus, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CreateBoardDialog } from "@/components/features/boards/create-board-dialog";
import {
  APP_NAV_FOOTER,
  APP_NAV_GENERAL,
  APP_NAV_INSIGHTS,
  APP_NAV_MORE,
  APP_NAV_PLANNING,
  isNavActive,
  type AppNavItemDef,
} from "@/components/layout/app-nav";
import { useActiveWorkspace } from "@/components/layout/active-workspace-context";
import { WorkspaceSwitcher } from "@/components/layout/workspace-switcher";
import { useAuth } from "@/hooks/use-auth";
import { useHome } from "@/hooks/use-home";
import { useMyInvitations } from "@/hooks/use-workspaces";
import { HOME_ROUTE } from "@/lib/auth/config";
import { cn } from "@/lib/utils";

const sidebarVariants = {
  open: { width: "15rem" },
  closed: { width: "3.05rem" },
};

const transitionProps: Transition = {
  type: "tween",
  ease: "easeOut",
  duration: 0.2,
};

type NavItem = {
  label: string;
  href: string;
  icon: AppNavItemDef["icon"];
  badge?: string | number;
};

function mapNav(
  defs: AppNavItemDef[],
  t: (key: AppNavItemDef["labelKey"]) => string,
  assignedCount: number,
): NavItem[] {
  return defs.map((def) => ({
    label: t(def.labelKey),
    href: def.href,
    icon: def.icon,
    badge:
      def.boardsBadge && assignedCount > 0 ? assignedCount : undefined,
  }));
}

/** Row: icon + label packed to the outer edge (right in FA, left in EN). */
function NavLink({
  item,
  isCollapsed,
  pathname,
  isRtl,
}: {
  item: NavItem;
  isCollapsed: boolean;
  pathname: string;
  isRtl: boolean;
}) {
  const active = isNavActive(pathname, item.href);
  const Icon = item.icon;

  const label = (
    <span className={cn("flex min-w-0 items-center gap-2", isCollapsed && "sr-only")}>
      <span className="truncate text-sm font-medium">{item.label}</span>
      {item.badge != null && (
        <Badge
          variant="outline"
          className="h-fit shrink-0 rounded border-none bg-muted px-1.5 text-muted-foreground"
        >
          {item.badge}
        </Badge>
      )}
    </span>
  );

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      aria-label={item.label}
      className={cn(
        "flex h-8 w-full items-center gap-2 rounded-full px-2.5 py-1.5 transition focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        isRtl ? "justify-end" : "justify-start",
        active
          ? "bg-sidebar-accent font-medium text-foreground"
          : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      )}
    >
      {isRtl ? (
        <>
          {label}
          <Icon className="size-4 shrink-0" />
        </>
      ) : (
        <>
          <Icon className="size-4 shrink-0" />
          {label}
        </>
      )}
    </Link>
  );
}

export function SessionNavBar() {
  const [pinned, setPinned] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  useEffect(() => {
    const stored = window.localStorage.getItem("sidebar-pinned");
    if (stored === "1") {
      setPinned(true);
      setIsCollapsed(false);
    }
  }, []);
  const [interactionLocked, setInteractionLocked] = useState(false);
  const pointerInsideRef = useRef(false);
  const locksRef = useRef(new Set<string>());
  const pathname = usePathname();
  const locale = useLocale();
  const isRtl = locale === "fa";
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const { user, logout } = useAuth();
  const { workspaceId, workspace } = useActiveWorkspace();
  const { data: home } = useHome();

  const setInteractionLock = useCallback((id: string, locked: boolean) => {
    if (locked) locksRef.current.add(id);
    else locksRef.current.delete(id);
    setInteractionLocked(locksRef.current.size > 0);
  }, []);

  useEffect(() => {
    if (!interactionLocked && !pointerInsideRef.current) {
      setIsCollapsed(true);
    }
  }, [interactionLocked]);

  const assignedCount =
    home?.assignedCards.filter((c) => !c.archivedAt).length ?? 0;
  const { data: invitations = [] } = useMyInvitations(!!user);
  const inviteCount = invitations.length;

  const initials = (user?.displayName || user?.username || "?")
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const general = useMemo(
    () => mapNav(APP_NAV_GENERAL, t, assignedCount),
    [t, assignedCount],
  );
  const insights = useMemo(
    () => mapNav(APP_NAV_INSIGHTS, t, assignedCount),
    [t, assignedCount],
  );
  const planning = useMemo(
    () => mapNav(APP_NAV_PLANNING, t, assignedCount),
    [t, assignedCount],
  );
  const more = useMemo(
    () => mapNav(APP_NAV_MORE, t, assignedCount),
    [t, assignedCount],
  );
  const footer = useMemo(
    () => mapNav(APP_NAV_FOOTER, t, assignedCount),
    [t, assignedCount],
  );

  const showExpanded = !isCollapsed || interactionLocked;

  return (
    <motion.div
      className={cn(
        "sidebar fixed z-40 hidden h-full shrink-0 border-sidebar-border md:block",
        isRtl ? "right-0 border-l" : "left-0 border-r",
      )}
      initial={showExpanded ? "open" : "closed"}
      animate={showExpanded ? "open" : "closed"}
      variants={sidebarVariants}
      transition={transitionProps}
      onMouseEnter={() => {
        pointerInsideRef.current = true;
        window.setTimeout(() => {
          if (pointerInsideRef.current) setIsCollapsed(false);
        }, 150);
      }}
      onMouseLeave={() => {
        pointerInsideRef.current = false;
        if (!interactionLocked && !pinned) setIsCollapsed(true);
      }}
      onFocusCapture={() => setIsCollapsed(false)}
    >
      <div
        dir="ltr"
        className="relative z-40 flex h-full w-full flex-col bg-sidebar text-sidebar-foreground backdrop-blur-xl"
      >
        {/* Brand */}
        <div
          className={cn(
            "flex h-[54px] w-full shrink-0 items-center gap-2 border-b border-sidebar-border p-2",
            isRtl ? "justify-end" : "justify-start",
          )}
        >
          {isRtl ? (
            <>
              {showExpanded && (
                <p className="truncate text-sm font-semibold">
                  {tCommon("brand")}
                </p>
              )}
              <Link
                href={HOME_ROUTE}
                className="flex size-8 shrink-0 items-center justify-center rounded-md outline-none hover:bg-muted"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.svg"
                  alt={tCommon("brand")}
                  width={20}
                  height={20}
                  className="size-5"
                />
              </Link>
            </>
          ) : (
            <>
              <Link
                href={HOME_ROUTE}
                className="flex size-8 shrink-0 items-center justify-center rounded-md outline-none hover:bg-muted"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.svg"
                  alt={tCommon("brand")}
                  width={20}
                  height={20}
                  className="size-5"
                />
              </Link>
              {showExpanded && (
                <p className="truncate text-sm font-semibold">
                  {tCommon("brand")}
                </p>
              )}
            </>
          )}
          {showExpanded && (
            <button
              type="button"
              aria-pressed={pinned}
              aria-label={t("pinSidebar")}
              className={cn(
                "ms-auto rounded-md p-1 text-muted-foreground hover:bg-muted",
                pinned && "text-primary",
              )}
              onClick={() => {
                const next = !pinned;
                setPinned(next);
                window.localStorage.setItem("sidebar-pinned", next ? "1" : "0");
                setIsCollapsed(!next);
              }}
            >
              <Pin className="size-3.5" />
            </button>
          )}
        </div>

        {/* Workspace */}
        <div className="w-full border-b border-sidebar-border p-2">
          <WorkspaceSwitcher
            onInteractionLockChange={(locked) =>
              setInteractionLock("workspace", locked)
            }
            className={cn(!showExpanded && "sr-only")}
            triggerClassName="h-8 rounded-md"
            rtl={isRtl}
          />
          {!showExpanded && (
            <div className={cn("flex", isRtl ? "justify-end" : "justify-start")}>
              <Avatar className="size-6 rounded-md" aria-hidden>
                <AvatarFallback className="rounded-md text-[10px]">
                  {(workspace?.name ?? "W").slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>

        {/* Create */}
        <div className="w-full px-2 pt-2">
          {workspaceId ? (
            <CreateBoardDialog
              workspaceId={workspaceId}
              trigger={
                <Button
                  size="sm"
                  className={cn(
                    "h-8 w-full gap-2",
                    isRtl ? "flex-row-reverse justify-center" : "justify-center",
                    !showExpanded && "px-2",
                  )}
                >
                  <Plus className="size-4 shrink-0" />
                  {showExpanded && t("create")}
                </Button>
              }
            />
          ) : (
            <Button
              size="sm"
              variant="outline"
              disabled
              className={cn(
                "h-8 w-full gap-2 justify-center",
                isRtl && "flex-row-reverse",
                !showExpanded && "px-2",
              )}
            >
              <Plus className="size-4 shrink-0" />
              {showExpanded && t("create")}
            </Button>
          )}
        </div>

        {/* Nav */}
        <ScrollArea className="min-h-0 flex-1 p-2">
          <div className="flex w-full flex-col gap-1">
            {general.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                isCollapsed={!showExpanded}
                pathname={pathname}
                isRtl={isRtl}
              />
            ))}
            <Separator className="my-1 w-full" />
            {insights.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                isCollapsed={!showExpanded}
                pathname={pathname}
                isRtl={isRtl}
              />
            ))}
            <Separator className="my-1 w-full" />
            {planning.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                isCollapsed={!showExpanded}
                pathname={pathname}
                isRtl={isRtl}
              />
            ))}
            <Separator className="my-1 w-full" />
            {more.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                isCollapsed={!showExpanded}
                pathname={pathname}
                isRtl={isRtl}
              />
            ))}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex flex-col gap-1 border-t border-sidebar-border p-2">
          {footer.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              isCollapsed={!showExpanded}
              pathname={pathname}
              isRtl={isRtl}
            />
          ))}

          <DropdownMenu
            modal={false}
            onOpenChange={(open) => setInteractionLock("account", open)}
          >
            <DropdownMenuTrigger className="w-full outline-none">
              <div
                className={cn(
                  "relative flex h-8 w-full items-center gap-2 rounded-full px-2.5 py-1.5 transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isRtl ? "justify-end" : "justify-start",
                )}
              >
                {isRtl ? (
                  <>
                    {showExpanded && (
                      <span className="truncate text-sm font-medium">
                        {user?.displayName || user?.username || t("profile")}
                      </span>
                    )}
                    <Avatar className="size-4">
                      <AvatarFallback className="text-[9px]">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </>
                ) : (
                  <>
                    <Avatar className="size-4">
                      <AvatarFallback className="text-[9px]">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    {showExpanded && (
                      <span className="truncate text-sm font-medium">
                        {user?.displayName || user?.username || t("profile")}
                      </span>
                    )}
                  </>
                )}
                {inviteCount > 0 && (
                  <span className="absolute end-1 top-1 size-1.5 rounded-full bg-primary" />
                )}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent sideOffset={5} align={isRtl ? "end" : "start"}>
              <div
                className={cn(
                  "flex items-center gap-2 p-2",
                  isRtl && "flex-row-reverse",
                )}
              >
                <Avatar className="size-6">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    "flex min-w-0 flex-col",
                    isRtl ? "text-right" : "text-left",
                  )}
                >
                  <span className="truncate text-sm font-medium">
                    {user?.displayName || user?.username}
                  </span>
                  <span className="line-clamp-1 text-xs text-muted-foreground">
                    {user?.email || user?.username}
                  </span>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href="/settings"
                  className={cn(
                    "flex items-center gap-2",
                    isRtl && "flex-row-reverse",
                  )}
                >
                  <Settings className="size-4" /> {t("settings")}
                </Link>
              </DropdownMenuItem>
              {inviteCount > 0 && (
                <DropdownMenuItem asChild>
                  <Link
                    href="/invitations"
                    className={cn(
                      "flex items-center gap-2",
                      isRtl && "flex-row-reverse",
                    )}
                  >
                    <Mail className="size-4" />
                    <span className="flex-1">{t("invitations")}</span>
                    <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                      {inviteCount}
                    </Badge>
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className={cn(
                  "flex items-center gap-2",
                  isRtl && "flex-row-reverse",
                )}
                onSelect={() => {
                  void logout();
                }}
              >
                <LogOut className="size-4" /> {t("signOut")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  );
}

export function SidebarDemo() {
  return (
    <div className="flex h-screen w-screen flex-row">
      <SessionNavBar />
      <main className="ms-[3.05rem] flex h-screen grow flex-col overflow-auto" />
    </div>
  );
}
