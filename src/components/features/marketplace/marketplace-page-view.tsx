"use client";

import { useTranslations } from "next-intl";
import { Package } from "lucide-react";
import { toast } from "sonner";
import { useActiveWorkspace } from "@/components/layout/active-workspace-context";
import {
  useInstallPack,
  useMarketplacePacks,
} from "@/hooks/use-marketplace";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

export function MarketplacePageView() {
  const t = useTranslations("marketplace");
  const { workspaceId } = useActiveWorkspace();
  const { data: packs = [], isLoading, isError } = useMarketplacePacks();
  const install = useInstallPack(workspaceId ?? "");

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-6 md:px-6">
      <PageHeader title={t("title")} description={t("subtitle")} />

      {isLoading && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
      )}

      {isError && (
        <EmptyState
          icon={Package}
          title={t("errorTitle")}
          description={t("errorBody")}
        />
      )}

      {!isLoading && !isError && packs.length === 0 && (
        <EmptyState
          icon={Package}
          title={t("emptyTitle")}
          description={t("emptyBody")}
        />
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {packs.map((pack) => (
          <div
            key={pack.id}
            className="flex flex-col rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-medium">{pack.name}</h2>
              <Badge variant="secondary">{pack.kind}</Badge>
            </div>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">
              {pack.description || t("noDescription")}
            </p>
            <Button
              className="mt-4 cursor-pointer"
              size="sm"
              disabled={!workspaceId || install.isPending}
              onClick={() =>
                install.mutate(pack.id, {
                  onSuccess: () => toast.success(t("installed")),
                  onError: () => toast.error(t("installFailed")),
                })
              }
            >
              {t("install")}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
