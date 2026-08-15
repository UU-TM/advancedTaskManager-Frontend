"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { LOGIN_ROUTE } from "@/lib/auth/config";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { PageHeader } from "@/components/ui/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Account profile — identity, theme, and sign out.
 */
export function ProfilePageView() {
  const t = useTranslations("profile");
  const tCommon = useTranslations("common");
  const tNav = useTranslations("nav");
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  const displayName = user?.displayName ?? user?.username ?? "";

  async function handleLogout() {
    await logout();
    router.push(LOGIN_ROUTE);
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg space-y-4 px-4 py-8 md:px-8">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8 md:px-8">
        <p className="text-sm text-muted-foreground">{t("notSignedIn")}</p>
        <Button asChild className="mt-4 cursor-pointer">
          <a href={LOGIN_ROUTE}>{tNav("signIn")}</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-8 md:px-8">
      <PageHeader
        title={t("title")}
        description={t("subtitle")}
        actions={
          <Button asChild variant="outline" className="cursor-pointer">
            <Link href="/settings">{t("editAccount")}</Link>
          </Button>
        }
      />

      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
          <Avatar className="size-14 border border-border">
            <AvatarImage
              src={user.avatarUrl ?? undefined}
              alt={displayName}
            />
            <AvatarFallback className="text-base">
              {initials(displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <CardTitle className="truncate text-lg">{displayName}</CardTitle>
            <CardDescription className="truncate">
              @{user.username}
              {user.email ? ` · ${user.email}` : ""}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">{t("username")}</span>
              <span className="font-medium">{user.username}</span>
            </div>
            {user.id && (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">{t("userId")}</span>
                <span className="truncate font-mono text-xs text-muted-foreground">
                  {user.id}
                </span>
              </div>
            )}
          </div>

          <Separator />

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">{tCommon("theme")}</p>
              <p className="text-xs text-muted-foreground">{t("themeHint")}</p>
            </div>
            <ThemeToggle />
          </div>

          <Separator />

          <Button
            variant="destructive"
            className="w-full cursor-pointer"
            onClick={() => void handleLogout()}
          >
            <LogOut className="me-2 size-4" />
            {tNav("signOut")}
          </Button>
        </CardContent>
      </Card>

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <UserIcon className="size-3.5" />
        {t("hint")}
      </p>
    </div>
  );
}
