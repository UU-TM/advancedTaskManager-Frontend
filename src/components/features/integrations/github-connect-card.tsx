"use client";

import { Github, Loader2, Unlink } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useDisconnectGithub, useGithubStatus } from "@/hooks/use-github";
import { getGithubConnectUrl } from "@/lib/api";
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

export function GithubConnectCard() {
  const t = useTranslations("integrations");
  const { data: status, isLoading } = useGithubStatus();
  const disconnect = useDisconnectGithub();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-foreground text-background">
            <Github className="size-5" />
          </div>
          <div>
            <CardTitle>{t("github.title")}</CardTitle>
            <CardDescription>{t("github.description")}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <Skeleton className="h-9 w-40" />
        ) : status?.connected ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge className="font-normal">{t("github.connected")}</Badge>
              {status.login && (
                <span className="text-sm text-muted-foreground">@{status.login}</span>
              )}
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="cursor-pointer">
                  <Unlink className="me-2 size-4" />
                  {t("github.disconnect")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("github.disconnectTitle")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("github.disconnectDescription")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="cursor-pointer">
                    {t("cancel")}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    className="cursor-pointer bg-destructive text-white hover:bg-destructive/90"
                    onClick={() =>
                      disconnect.mutate(undefined, {
                        onSuccess: () => toast.success(t("github.disconnected")),
                        onError: () => toast.error(t("github.disconnectFailed")),
                      })
                    }
                  >
                    {disconnect.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      t("github.disconnect")
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Badge variant="secondary" className="font-normal">
              {t("github.notConnected")}
            </Badge>
            <Button
              size="sm"
              className="cursor-pointer"
              onClick={() => {
                window.location.href = getGithubConnectUrl();
              }}
            >
              <Github className="me-2 size-4" />
              {t("github.connect")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
