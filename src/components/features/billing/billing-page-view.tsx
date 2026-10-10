"use client";

import { useTranslations } from "next-intl";
import { CreditCard } from "lucide-react";
import { toast } from "sonner";
import { useActiveWorkspace } from "@/components/layout/active-workspace-context";
import {
  useBilling,
  useCheckout,
  useGrantPlan,
} from "@/hooks/use-billing";
import type { BillingPlan } from "@/lib/api";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

const PAID: Exclude<BillingPlan, "FREE">[] = ["TEAM", "BUSINESS"];
const ALL: BillingPlan[] = ["FREE", "TEAM", "BUSINESS"];

export function BillingPageView() {
  const t = useTranslations("billing");
  const { workspaceId } = useActiveWorkspace();
  const { data, isLoading, isError } = useBilling(workspaceId);
  const grant = useGrantPlan(workspaceId ?? "");
  const checkout = useCheckout(workspaceId ?? "");

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-6 md:px-6">
      <PageHeader title={t("title")} description={t("subtitle")} />

      {!workspaceId && (
        <EmptyState
          icon={CreditCard}
          title={t("noWorkspace")}
          description={t("noWorkspaceBody")}
        />
      )}

      {isLoading && <Skeleton className="h-40 w-full rounded-md" />}

      {isError && (
        <EmptyState
          icon={CreditCard}
          title={t("errorTitle")}
          description={t("errorBody")}
        />
      )}

      {data && (
        <div className="space-y-6">
          <div className="rounded-md border border-border bg-card p-5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold">{t("currentPlan")}</h2>
              <Badge>{data.plan}</Badge>
            </div>
            <dl className="mt-4 grid gap-3 sm:grid-cols-3 text-sm">
              <div>
                <dt className="text-muted-foreground">{t("seats")}</dt>
                <dd className="font-medium">{data.seats}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("aiCalls")}</dt>
                <dd className="font-medium">
                  {data.aiCallsUsed} / {data.entitlements.maxAiCallsPerMonth}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("maxBoards")}</dt>
                <dd className="font-medium">{data.entitlements.maxBoards}</dd>
              </div>
            </dl>
          </div>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold">{t("checkout")}</h3>
            <div className="flex flex-wrap gap-2">
              {PAID.map((plan) => (
                <Button
                  key={plan}
                  variant="outline"
                  className="cursor-pointer"
                  disabled={checkout.isPending}
                  onClick={() =>
                    checkout.mutate(
                      {
                        plan,
                        successUrl:
                          typeof window !== "undefined"
                            ? `${window.location.origin}/billing`
                            : undefined,
                        cancelUrl:
                          typeof window !== "undefined"
                            ? `${window.location.origin}/billing`
                            : undefined,
                      },
                      {
                        onSuccess: (res) => {
                          const url = res.url ?? res.checkoutUrl;
                          if (url) window.location.href = url;
                          else toast.success(t("checkoutCreated"));
                        },
                        onError: () => toast.error(t("checkoutFailed")),
                      },
                    )
                  }
                >
                  {t("checkoutPlan", { plan })}
                </Button>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold">{t("grant")}</h3>
            <p className="text-xs text-muted-foreground">{t("grantHint")}</p>
            <div className="flex flex-wrap gap-2">
              {ALL.map((plan) => (
                <Button
                  key={plan}
                  size="sm"
                  variant="secondary"
                  className="cursor-pointer"
                  disabled={grant.isPending}
                  onClick={() =>
                    grant.mutate(
                      { plan },
                      {
                        onSuccess: () => toast.success(t("granted")),
                        onError: () => toast.error(t("grantFailed")),
                      },
                    )
                  }
                >
                  {t("grantPlan", { plan })}
                </Button>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
