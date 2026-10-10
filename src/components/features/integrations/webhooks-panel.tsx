"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Trash2, Webhook } from "lucide-react";
import { toast } from "sonner";
import { useActiveWorkspace } from "@/components/layout/active-workspace-context";
import {
  useCreateWebhook,
  useDeleteWebhook,
  useUpdateWebhook,
  useWebhooks,
} from "@/hooks/use-webhooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DEFAULT_EVENTS = [
  "card.created",
  "card.updated",
  "card.moved",
  "board.updated",
];

export function WebhooksPanel() {
  const t = useTranslations("integrations.webhooks");
  const { workspaceId } = useActiveWorkspace();
  const { data: webhooks = [], isLoading } = useWebhooks(workspaceId);
  const createWebhook = useCreateWebhook(workspaceId ?? "");
  const updateWebhook = useUpdateWebhook(workspaceId ?? "");
  const deleteWebhook = useDeleteWebhook(workspaceId ?? "");

  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [secret, setSecret] = useState("");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <Webhook className="size-4" />
            {t("title")}
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={!workspaceId} className="cursor-pointer">
              <Plus className="me-1 size-4" />
              {t("add")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("addTitle")}</DialogTitle>
            </DialogHeader>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (!workspaceId) return;
                createWebhook.mutate(
                  {
                    url: url.trim(),
                    secret: secret.trim(),
                    events: DEFAULT_EVENTS,
                    enabled: true,
                  },
                  {
                    onSuccess: () => {
                      toast.success(t("created"));
                      setOpen(false);
                      setUrl("");
                      setSecret("");
                    },
                    onError: () => toast.error(t("createFailed")),
                  },
                );
              }}
            >
              <div className="space-y-1.5">
                <Label htmlFor="wh-url">{t("url")}</Label>
                <Input
                  id="wh-url"
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/hooks/kanban"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="wh-secret">{t("secret")}</Label>
                <Input
                  id="wh-secret"
                  type="password"
                  required
                  minLength={8}
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={createWebhook.isPending}>
                {t("add")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading && <Skeleton className="h-12 w-full" />}
        {!isLoading && webhooks.length === 0 && (
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        )}
        <ul className="space-y-3">
          {webhooks.map((wh) => (
            <li
              key={wh.id}
              className="flex flex-wrap items-center gap-3 rounded-md border border-border p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{wh.url}</p>
                <p className="text-xs text-muted-foreground">
                  {wh.events.join(", ")}
                </p>
              </div>
              <Switch
                checked={wh.enabled}
                onCheckedChange={(enabled) =>
                  updateWebhook.mutate(
                    { id: wh.id, enabled },
                    {
                      onError: () => toast.error(t("updateFailed")),
                    },
                  )
                }
              />
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-destructive"
                onClick={() =>
                  deleteWebhook.mutate(wh.id, {
                    onSuccess: () => toast.success(t("deleted")),
                    onError: () => toast.error(t("deleteFailed")),
                  })
                }
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
