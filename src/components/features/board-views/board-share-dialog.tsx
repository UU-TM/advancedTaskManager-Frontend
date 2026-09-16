"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Copy, Link2, Share2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  useCreateShareLink,
  useRevokeShareLink,
  useShareLinks,
} from "@/hooks/use-share-links";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export function BoardShareDialog({ boardId }: { boardId: string }) {
  const t = useTranslations("share");
  const { data: links = [], isLoading } = useShareLinks(boardId);
  const create = useCreateShareLink(boardId);
  const revoke = useRevokeShareLink(boardId);
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");

  const active = links.filter((l) => !l.revokedAt);

  function publicUrl(token: string) {
    if (typeof window === "undefined") return `/public/boards/${token}`;
    return `${window.location.origin}/public/boards/${token}`;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="cursor-pointer">
          <Share2 className="me-2 size-4" />
          {t("share")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              create.mutate(
                password.trim() ? { password: password.trim() } : {},
                {
                  onSuccess: () => {
                    toast.success(t("created"));
                    setPassword("");
                  },
                  onError: () => toast.error(t("createFailed")),
                },
              );
            }}
          >
            <div className="space-y-2">
              <Label>{t("passwordOptional")}</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("passwordPlaceholder")}
              />
            </div>
            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={create.isPending}
            >
              <Link2 className="me-1.5 size-4" />
              {t("create")}
            </Button>
          </form>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("activeLinks")}
            </p>
            {isLoading && (
              <p className="text-sm text-muted-foreground">{t("loading")}</p>
            )}
            {!isLoading && active.length === 0 && (
              <p className="text-sm text-muted-foreground">{t("empty")}</p>
            )}
            <ul className="space-y-2">
              {active.map((link) => (
                <li
                  key={link.id}
                  className="flex items-center gap-2 rounded-lg border border-border px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-xs">{link.token}</p>
                    <div className="mt-1 flex gap-1">
                      {link.hasPassword && (
                        <Badge variant="outline" className="text-[10px]">
                          {t("passwordProtected")}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 cursor-pointer"
                    onClick={() => {
                      void navigator.clipboard.writeText(publicUrl(link.token));
                      toast.success(t("copied"));
                    }}
                  >
                    <Copy className="size-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 cursor-pointer text-destructive"
                    onClick={() =>
                      revoke.mutate(link.id, {
                        onSuccess: () => toast.success(t("revoked")),
                        onError: () => toast.error(t("revokeFailed")),
                      })
                    }
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
