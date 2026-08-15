"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  Bell,
  Calendar as CalendarIcon,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  User as UserIcon,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useDashboardDate } from "./dashboard-date-context";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/hooks/use-notifications";
import { LOGIN_ROUTE } from "@/lib/auth/config";
import { formatAppDate } from "@/lib/date";
import type { Locale } from "@/i18n/config";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LocaleSwitcher } from "./locale-switcher";
import { ThemeToggle } from "./theme-toggle";
import { SidebarNav } from "./sidebar";
import { useCommandPalette } from "./command-palette";
import { cn } from "@/lib/utils";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function HeaderSearch() {
  const t = useTranslations("nav");
  const { setOpen, shortcutLabel } = useCommandPalette();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="cursor-pointer gap-2 rounded-full text-muted-foreground"
      aria-label={t("search")}
      onClick={() => setOpen(true)}
    >
      <Search className="size-4" />
      <span className="hidden text-xs md:inline">{shortcutLabel}</span>
    </Button>
  );
}

function HeaderNotifications() {
  const t = useTranslations("nav");
  const router = useRouter();
  const { data: notifications = [] } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const unread = notifications.filter((n) => !n.readAt).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative cursor-pointer rounded-full"
          aria-label={t("notifications")}
        >
          <Bell className="size-4" />
          {unread > 0 && (
            <span className="absolute -end-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-dashboard-accent px-1 text-[10px] font-semibold leading-4 text-primary-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <p className="text-sm font-semibold">{t("notifications")}</p>
          {unread > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 cursor-pointer text-xs"
              onClick={() => void markAll.mutateAsync()}
            >
              {t("markAllRead")}
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              {t("noNotifications")}
            </p>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                type="button"
                className={cn(
                  "flex w-full cursor-pointer flex-col gap-0.5 border-b px-3 py-2.5 text-start last:border-0 hover:bg-muted/60",
                  !n.readAt && "bg-muted/40",
                )}
                onClick={() => {
                  void markRead.mutateAsync(n.id);
                  if (n.href) router.push(n.href);
                }}
              >
                <span className="text-sm font-medium">{n.title}</span>
                <span className="text-xs text-muted-foreground">{n.body}</span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function HeaderDatePicker() {
  const t = useTranslations("nav");
  const locale = useLocale() as Locale;
  const { selectedDate, setSelectedDate } = useDashboardDate();
  const label = useMemo(
    () =>
      formatAppDate(selectedDate.toISOString(), "EEEE, MMMM d", locale) ?? "",
    [selectedDate, locale],
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium outline-none hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={t("pickDate")}
        >
          <CalendarIcon className="size-4 text-muted-foreground" />
          <span className="hidden sm:inline">{label}</span>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            if (date) {
              const next = new Date(date);
              next.setHours(0, 0, 0, 0);
              setSelectedDate(next);
            }
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

/**
 * Sticky top bar with mobile nav sheet + user menu.
 */
export function Header({ leading }: { leading?: ReactNode }) {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const sheetSide = locale === "fa" ? "right" : "left";
  const isHome = pathname === "/home" || pathname.startsWith("/home/");

  async function handleLogout() {
    await logout();
    router.push(LOGIN_ROUTE);
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border/60 bg-background/90 px-3 backdrop-blur-sm md:px-5">
      <div className="flex items-center gap-2 md:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={t("openNavigation")}>
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side={sheetSide} className="w-64 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>{t("navigation")}</SheetTitle>
            </SheetHeader>
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-2">
        {isHome && <HeaderDatePicker />}
        {leading}
      </div>

      <div className="flex items-center gap-0.5">
        <HeaderSearch />
        {isAuthenticated && <HeaderNotifications />}
        <LocaleSwitcher />

        {isAuthenticated && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="ms-1 flex cursor-pointer items-center gap-2 rounded-full outline-none transition-opacity duration-150 hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={t("openUserMenu")}
              >
                <Avatar className="size-8 border border-border">
                  <AvatarImage
                    src={user.avatarUrl ?? undefined}
                    alt={user.username}
                  />
                  <AvatarFallback className="text-xs">
                    {initials(user.displayName ?? user.username)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden max-w-[8rem] truncate text-sm font-medium lg:inline">
                  {user.displayName ?? user.username}
                </span>
                <ChevronDown className="hidden size-3.5 text-muted-foreground lg:inline" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {user.displayName ?? user.username}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {user.email ?? `@${user.username}`}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
                  <UserIcon className="me-2 size-4" />
                  {t("profile")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="flex items-center justify-between px-2 py-1.5">
                <span className="text-sm">{tCommon("theme")}</span>
                <ThemeToggle />
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => void handleLogout()}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="me-2 size-4" />
                {t("signOut")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild size="sm" variant="default">
            <Link href="/login">{t("signIn")}</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
