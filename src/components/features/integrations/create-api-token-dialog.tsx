"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy, KeyRound, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useCreateApiToken } from "@/hooks/use-api-tokens";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function CreateApiTokenDialog() {
  const t = useTranslations("integrations");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [scopesInput, setScopesInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const createToken = useCreateApiToken();

  function reset() {
    setName("");
    setScopesInput("");
    setError(null);
    setCreatedToken(null);
    setCopied(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setError(null);
    const scopes = scopesInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    try {
      const created = await createToken.mutateAsync({
        name: trimmed,
        scopes: scopes.length ? scopes : undefined,
      });
      setCreatedToken(created.token);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("tokens.createFailed"));
    }
  }

  async function handleCopy() {
    if (!createdToken) return;
    await navigator.clipboard.writeText(createdToken);
    setCopied(true);
    toast.success(t("tokens.copied"));
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" className="cursor-pointer">
          <Plus className="me-2 size-4" />
          {t("tokens.create")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {createdToken ? (
          <>
            <DialogHeader>
              <DialogTitle>{t("tokens.createdTitle")}</DialogTitle>
              <DialogDescription>{t("tokens.createdDescription")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <Alert>
                <AlertDescription>{t("tokens.copyWarning")}</AlertDescription>
              </Alert>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={createdToken}
                  className="font-mono text-xs"
                  onFocus={(e) => e.currentTarget.select()}
                />
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="shrink-0 cursor-pointer"
                  onClick={() => void handleCopy()}
                  aria-label={t("tokens.copy")}
                >
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button className="w-full sm:w-auto" onClick={() => setOpen(false)}>
                {t("tokens.done")}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{t("tokens.createTitle")}</DialogTitle>
              <DialogDescription>{t("tokens.createDescription")}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="token-name">{t("tokens.name")}</Label>
                <Input
                  id="token-name"
                  autoFocus
                  autoComplete="off"
                  placeholder={t("tokens.namePlaceholder")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="token-scopes">{t("tokens.scopes")}</Label>
                <Input
                  id="token-scopes"
                  autoComplete="off"
                  placeholder={t("tokens.scopesPlaceholder")}
                  value={scopesInput}
                  onChange={(e) => setScopesInput(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">{t("tokens.scopesHint")}</p>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="submit"
                disabled={createToken.isPending || !name.trim()}
                className="w-full sm:w-auto"
              >
                {createToken.isPending ? (
                  <>
                    <Loader2 className="me-2 size-4 animate-spin" />
                    {t("tokens.creating")}
                  </>
                ) : (
                  <>
                    <KeyRound className="me-2 size-4" />
                    {t("tokens.create")}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
