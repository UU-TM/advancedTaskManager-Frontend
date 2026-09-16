"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Inbox } from "lucide-react";
import { useInbox } from "@/hooks/use-inbox";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { formatAppDate } from "@/lib/date";
import { useLocale } from "next-intl";
import type { Locale } from "@/i18n/config";

export function InboxPageView() {
  const t = useTranslations("inbox");
  const locale = useLocale() as Locale;
  const { data = [], isLoading, isError } = useInbox();

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-6 md:px-6">
      <PageHeader title={t("title")} description={t("subtitle")} />

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      )}

      {isError && (
        <EmptyState
          icon={Inbox}
          title={t("errorTitle")}
          description={t("errorBody")}
        />
      )}

      {!isLoading && data.length === 0 && (
        <EmptyState
          icon={Inbox}
          title={t("emptyTitle")}
          description={t("emptyBody")}
        />
      )}

      {data.length > 0 && (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {data.map((item) => (
            <li key={item.id} className="px-4 py-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="font-medium hover:underline"
                    >
                      {item.title}
                    </Link>
                  ) : (
                    <p className="font-medium">{item.title}</p>
                  )}
                  {item.body && (
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {item.body}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!item.readAt && (
                    <Badge variant="secondary">{t("unread")}</Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatAppDate(item.createdAt, "d MMM HH:mm", locale)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
