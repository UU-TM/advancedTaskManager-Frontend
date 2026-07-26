"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { LogOut, Menu, User as UserIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { LOGIN_ROUTE } from "@/lib/auth/config";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LocaleSwitcher } from "./locale-switcher";
import { SidebarNav } from "./sidebar";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Sticky top bar with mobile nav sheet + user menu.
 */
export function Header({ leading }: { leading?: ReactNode }) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const sheetSide = locale === "fa" ? "right" : "left";

  async function handleLogout() {
    await logout();
    router.push(LOGIN_ROUTE);
  }

  return (
    <header className="sticky top-0 z-30 flex h-12 items-center gap-3 border-b border-border/80 bg-background/90 px-3 backdrop-blur-sm md:px-5">
      <div className="flex items-center gap-2 md:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={t("openNavigation")}>
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side={sheetSide} className="w-56 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>{t("navigation")}</SheetTitle>
            </SheetHeader>
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex-1">{leading}</div>

      <LocaleSwitcher />

      {isAuthenticated && user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex cursor-pointer items-center gap-2 rounded-full outline-none transition-opacity duration-150 hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={t("openUserMenu")}
            >
              <Avatar className="size-7 border border-border">
                <AvatarImage src={user.avatarUrl} alt={user.username} />
                <AvatarFallback className="text-xs">
                  {initials(user.displayName ?? user.username)}
                </AvatarFallback>
              </Avatar>
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
    </header>
  );
}
