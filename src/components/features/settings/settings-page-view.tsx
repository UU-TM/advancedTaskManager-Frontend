"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  ExternalLink,
  Home,
  Keyboard,
  LayoutDashboard,
  LogOut,
  Plug,
  Shield,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  useChangePassword,
  useUpdateProfile,
  useUpdateUserSettings,
  useUserSettings,
} from "@/hooks/use-settings";
import { useMarkAllNotificationsRead } from "@/hooks/use-notifications";
import { LOGIN_ROUTE } from "@/lib/auth/config";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/ui/page-header";
import { ApiError } from "@/lib/api";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    return err.message || fallback;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

/**
 * Full account settings — profile, password, appearance, notifications, shortcuts.
 */
export function SettingsPageView() {
  const t = useTranslations("settings");
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { user, isLoading, logout, refreshUser } = useAuth();

  const { data: prefs, isLoading: prefsLoading } = useUserSettings();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const updateSettings = useUpdateUserSettings();
  const markAllRead = useMarkAllNotificationsRead();

  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!user) return;
    setDisplayName(user.displayName ?? "");
    setAvatarUrl(user.avatarUrl ?? "");
  }, [user]);

  const nameForAvatar =
    displayName.trim() || user?.displayName || user?.username || "";

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync({
        displayName: displayName.trim() || null,
        avatarUrl: avatarUrl.trim() || null,
      });
      await refreshUser();
      toast.success(t("account.saved"));
    } catch (err) {
      toast.error(errorMessage(err, t("account.saveFailed")));
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error(t("security.passwordTooShort"));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t("security.passwordMismatch"));
      return;
    }
    try {
      await changePassword.mutateAsync({
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success(t("security.saved"));
    } catch (err) {
      toast.error(errorMessage(err, t("security.saveFailed")));
    }
  }

  async function handleToggle(
    key: "emailNotifications" | "activityDigests",
    value: boolean,
  ) {
    try {
      await updateSettings.mutateAsync({ [key]: value });
      toast.success(t("notifications.saved"));
    } catch (err) {
      toast.error(errorMessage(err, t("notifications.saveFailed")));
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllRead.mutateAsync();
      toast.success(t("notifications.markedRead"));
    } catch (err) {
      toast.error(errorMessage(err, t("notifications.markFailed")));
    }
  }

  async function handleLogout() {
    await logout();
    router.push(LOGIN_ROUTE);
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-8 md:px-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-md" />
        <Skeleton className="h-40 w-full rounded-md" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 md:px-8">
        <p className="text-sm text-muted-foreground">{t("notSignedIn")}</p>
        <Button asChild className="mt-4 cursor-pointer">
          <Link href={LOGIN_ROUTE}>{tNav("signIn")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8 md:px-8">
      <PageHeader title={t("title")} description={t("subtitle")} />

      {/* Account */}
      <Card className="rounded-md">
        <CardHeader>
          <CardTitle>{t("account.title")}</CardTitle>
          <CardDescription>{t("account.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={(e) => void handleSaveProfile(e)}>
            <div className="flex items-center gap-4">
              <Avatar className="size-14 border border-border">
                <AvatarImage
                  src={avatarUrl || undefined}
                  alt={nameForAvatar}
                />
                <AvatarFallback className="text-base">
                  {initials(nameForAvatar || "?")}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 text-sm">
                <p className="truncate font-medium">{nameForAvatar}</p>
                <p className="truncate text-muted-foreground">@{user.username}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">{t("account.username")}</Label>
              <Input
                id="username"
                value={user.username}
                disabled
                readOnly
                className="bg-muted/40"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">{t("account.displayName")}</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={80}
                placeholder={t("account.displayNamePlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatarUrl">{t("account.avatarUrl")}</Label>
              <Input
                id="avatarUrl"
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://…"
              />
              <p className="text-xs text-muted-foreground">
                {t("account.avatarHint")}
              </p>
            </div>

            <Button
              type="submit"
              className="cursor-pointer"
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending
                ? tCommon("saving")
                : t("account.save")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="rounded-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="size-4 text-muted-foreground" />
            <CardTitle>{t("security.title")}</CardTitle>
          </div>
          <CardDescription>{t("security.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(e) => void handleChangePassword(e)}
          >
            <div className="space-y-2">
              <Label htmlFor="currentPassword">
                {t("security.currentPassword")}
              </Label>
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">{t("security.newPassword")}</Label>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                {t("security.confirmPassword")}
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <Button
              type="submit"
              className="cursor-pointer"
              disabled={changePassword.isPending}
            >
              {changePassword.isPending
                ? tCommon("saving")
                : t("security.save")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="rounded-md">
        <CardHeader>
          <CardTitle>{t("appearance.title")}</CardTitle>
          <CardDescription>{t("appearance.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">{tCommon("theme")}</p>
              <p className="text-xs text-muted-foreground">
                {t("appearance.themeHint")}
              </p>
            </div>
            <ThemeToggle />
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">{t("appearance.language")}</p>
              <p className="text-xs text-muted-foreground">
                {t("appearance.languageHint")}
              </p>
            </div>
            <LocaleSwitcher />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="rounded-md">
        <CardHeader>
          <CardTitle>{t("notifications.title")}</CardTitle>
          <CardDescription>{t("notifications.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {prefsLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : (
            <>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">
                    {t("notifications.email")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("notifications.emailHint")}
                  </p>
                </div>
                <Switch
                  checked={prefs?.emailNotifications ?? true}
                  disabled={updateSettings.isPending}
                  onCheckedChange={(v) =>
                    void handleToggle("emailNotifications", v)
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">
                    {t("notifications.digests")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("notifications.digestsHint")}
                  </p>
                </div>
                <Switch
                  checked={prefs?.activityDigests ?? true}
                  disabled={updateSettings.isPending}
                  onCheckedChange={(v) =>
                    void handleToggle("activityDigests", v)
                  }
                />
              </div>
            </>
          )}
          <Separator />
          <Button
            variant="outline"
            className="cursor-pointer"
            disabled={markAllRead.isPending}
            onClick={() => void handleMarkAllRead()}
          >
            {t("notifications.markAllRead")}
          </Button>
        </CardContent>
      </Card>

      {/* Keyboard shortcuts */}
      <Card className="rounded-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Keyboard className="size-4 text-muted-foreground" />
            <CardTitle>{t("shortcuts.title")}</CardTitle>
          </div>
          <CardDescription>{t("shortcuts.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm">{t("shortcuts.commandPalette")}</span>
            <kbd className="rounded-md border border-border bg-muted px-2 py-1 font-mono text-xs">
              Cmd+K
            </kbd>
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm">{t("shortcuts.toggleSidebar")}</span>
            <kbd className="rounded-md border border-border bg-muted px-2 py-1 font-mono text-xs">
              Cmd+B
            </kbd>
          </div>
        </CardContent>
      </Card>

      {/* Connected shortcuts */}
      <Card className="rounded-md">
        <CardHeader>
          <CardTitle>{t("connected.title")}</CardTitle>
          <CardDescription>{t("connected.description")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          <Button
            variant="outline"
            className="h-auto cursor-pointer justify-start gap-3 px-4 py-3"
            asChild
          >
            <Link href="/integrations">
              <Plug className="size-4 shrink-0" />
              <span className="flex flex-col items-start text-start">
                <span className="text-sm font-medium">
                  {t("connected.integrations")}
                </span>
                <span className="text-xs font-normal text-muted-foreground">
                  {t("connected.integrationsHint")}
                </span>
              </span>
              <ExternalLink className="ms-auto size-3.5 opacity-50" />
            </Link>
          </Button>
          <Button
            variant="outline"
            className="h-auto cursor-pointer justify-start gap-3 px-4 py-3"
            asChild
          >
            <Link href="/home">
              <LayoutDashboard className="size-4 shrink-0" />
              <span className="flex flex-col items-start text-start">
                <span className="text-sm font-medium">
                  {t("connected.home")}
                </span>
                <span className="text-xs font-normal text-muted-foreground">
                  {t("connected.homeHint")}
                </span>
              </span>
              <Home className="ms-auto size-3.5 opacity-50" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Session */}
      <Card className="rounded-md">
        <CardHeader>
          <CardTitle>{t("session.title")}</CardTitle>
          <CardDescription>{t("session.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            className="cursor-pointer"
            onClick={() => void handleLogout()}
          >
            <LogOut className="me-2 size-4" />
            {tNav("signOut")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
