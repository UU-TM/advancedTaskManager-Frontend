"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Bell, ChevronLeft, ChevronRight, Loader2, Plus, Video } from "lucide-react";
import { useDashboardDate } from "@/components/layout/dashboard-date-context";
import { useCreateReminder, useReminders } from "@/hooks/use-reminders";
import { ApiError } from "@/lib/api";
import { formatAppDate } from "@/lib/date";
import type { Locale } from "@/i18n/config";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { WidgetShell } from "./widget-shell";

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function ReminderWidget() {
  const t = useTranslations("dashboard.reminder");
  const locale = useLocale() as Locale;
  const { selectedDate } = useDashboardDate();
  const { data: reminders = [], isLoading } = useReminders();
  const createReminder = useCreateReminder();
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [scheduledLocal, setScheduledLocal] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const dayItems = reminders.filter((r) =>
      sameDay(new Date(r.scheduledAt), selectedDate),
    );
    return dayItems.length > 0 ? dayItems : reminders;
  }, [reminders, selectedDate]);

  const current = filtered[index] ?? filtered[0];
  const safeIndex = current ? filtered.indexOf(current) : 0;

  function prev() {
    if (filtered.length === 0) return;
    setIndex((i) => (i - 1 + filtered.length) % filtered.length);
  }

  function next() {
    if (filtered.length === 0) return;
    setIndex((i) => (i + 1) % filtered.length);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim() || !scheduledLocal) {
      setError(t("createFailed"));
      return;
    }
    try {
      const scheduledAt = new Date(scheduledLocal).toISOString();
      await createReminder.mutateAsync({
        title: title.trim(),
        scheduledAt,
        linkUrl: linkUrl.trim() || null,
      });
      setTitle("");
      setScheduledLocal("");
      setLinkUrl("");
      setOpen(false);
      setIndex(0);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("createFailed"));
    }
  }

  const href = current?.linkUrl
    ? current.linkUrl
    : current?.boardId
      ? `/boards/${current.boardId}${current.cardId ? `?card=${current.cardId}` : ""}`
      : null;

  return (
    <WidgetShell>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold">{t("title")}</h2>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="size-7 cursor-pointer rounded-full"
            aria-label={t("prev")}
            onClick={prev}
            disabled={filtered.length <= 1}
          >
            <ChevronLeft className="size-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-7 cursor-pointer rounded-full"
            aria-label={t("next")}
            onClick={next}
            disabled={filtered.length <= 1}
          >
            <ChevronRight className="size-3.5" />
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-7 cursor-pointer rounded-full"
                aria-label={t("add")}
              >
                <Plus className="size-3.5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={(e) => void onSubmit(e)}>
                <DialogHeader>
                  <DialogTitle>{t("addTitle")}</DialogTitle>
                  <DialogDescription>{t("addDescription")}</DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-1.5">
                    <Label htmlFor="reminder-title">{t("add")}</Label>
                    <Input
                      id="reminder-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="reminder-when">{t("scheduledAt")}</Label>
                    <Input
                      id="reminder-when"
                      type="datetime-local"
                      value={scheduledLocal}
                      onChange={(e) => setScheduledLocal(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="reminder-link">{t("linkUrl")}</Label>
                    <Input
                      id="reminder-link"
                      type="url"
                      placeholder={t("linkPlaceholder")}
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={createReminder.isPending}
                    className="cursor-pointer"
                  >
                    {createReminder.isPending ? (
                      <>
                        <Loader2 className="me-2 size-4 animate-spin" />
                        {t("creating")}
                      </>
                    ) : (
                      t("create")
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading && <Skeleton className="h-12 w-full" />}
      {!isLoading && !current && (
        <EmptyState
          icon={Bell}
          title={t("emptyTitle")}
          description={t("emptyDescription")}
          className="py-3"
        />
      )}
      {current && (
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            {href ? (
              <Link
                href={href}
                className="block truncate text-sm font-medium text-muted-foreground hover:text-foreground"
                {...(current.linkUrl
                  ? { target: "_blank", rel: "noreferrer" }
                  : {})}
              >
                {current.title}
              </Link>
            ) : (
              <p className="truncate text-sm font-medium text-muted-foreground">
                {current.title}
              </p>
            )}
            <p className="text-xs text-muted-foreground/80">
              {formatAppDate(current.scheduledAt, "d MMM HH:mm", locale)}
              {filtered.length > 1
                ? ` · ${safeIndex + 1}/${filtered.length}`
                : ""}
            </p>
          </div>
          {current.linkUrl ? (
            <a
              href={current.linkUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={t("openLink")}
              className="text-muted-foreground/50 transition-colors hover:text-muted-foreground"
            >
              <Video className="size-8" />
            </a>
          ) : (
            <Video className="size-8 text-muted-foreground/30" aria-hidden />
          )}
        </div>
      )}
    </WidgetShell>
  );
}
