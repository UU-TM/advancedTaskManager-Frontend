"use client";

import { useLocale, useTranslations } from "next-intl";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useApiTokens, useRevokeApiToken } from "@/hooks/use-api-tokens";
import { formatAppDate } from "@/lib/date";
import type { Locale } from "@/i18n/config";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CreateApiTokenDialog } from "./create-api-token-dialog";

export function ApiTokensPanel() {
  const t = useTranslations("integrations");
  const locale = useLocale() as Locale;
  const { data: tokens, isLoading } = useApiTokens();
  const revokeToken = useRevokeApiToken();

  const activeTokens = (tokens ?? []).filter((tok) => !tok.revokedAt);
  const revokedTokens = (tokens ?? []).filter((tok) => tok.revokedAt);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{t("tokens.title")}</CardTitle>
            <CardDescription>{t("tokens.description")}</CardDescription>
          </div>
          <CreateApiTokenDialog />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        )}

        {!isLoading && (tokens ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground">{t("tokens.empty")}</p>
        )}

        {!isLoading && activeTokens.length > 0 && (
          <ul className="divide-y divide-border">
            {activeTokens.map((token) => (
              <li
                key={token.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{token.name}</p>
                  <p className="truncate font-mono text-xs text-muted-foreground">
                    {token.tokenPrefix}…
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {token.lastUsedAt
                      ? t("tokens.lastUsed", {
                          date: formatAppDate(token.lastUsedAt, "d MMM yyyy", locale) ?? "",
                        })
                      : t("tokens.neverUsed")}
                  </p>
                  {token.scopes.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {token.scopes.map((scope) => (
                        <Badge key={scope} variant="outline" className="font-normal">
                          {scope}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 cursor-pointer text-muted-foreground hover:text-destructive"
                      aria-label={t("tokens.revoke")}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t("tokens.revokeTitle")}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t("tokens.revokeDescription", { name: token.name })}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="cursor-pointer">
                        {t("cancel")}
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="cursor-pointer bg-destructive text-white hover:bg-destructive/90"
                        onClick={() =>
                          revokeToken.mutate(token.id, {
                            onSuccess: () => toast.success(t("tokens.revoked")),
                            onError: () => toast.error(t("tokens.revokeFailed")),
                          })
                        }
                      >
                        {revokeToken.isPending ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          t("tokens.revoke")
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </li>
            ))}
          </ul>
        )}

        {!isLoading && revokedTokens.length > 0 && (
          <div className="mt-4 border-t border-border pt-3">
            <p className="mb-2 text-sm text-muted-foreground">
              {t("tokens.revokedSection")}
            </p>
            <ul className="space-y-1.5">
              {revokedTokens.map((token) => (
                <li
                  key={token.id}
                  className="flex items-center justify-between gap-2 text-sm text-muted-foreground"
                >
                  <span className="truncate">{token.name}</span>
                  <Badge variant="outline" className="font-normal">
                    {t("tokens.revoked")}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
