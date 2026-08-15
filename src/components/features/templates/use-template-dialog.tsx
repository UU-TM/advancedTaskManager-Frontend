"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { useCreateBoardFromTemplate } from "@/hooks/use-templates";
import { ApiError } from "@/lib/api";
import type { BoardTemplate } from "@/types/domain";
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

interface UseTemplateDialogProps {
  template: BoardTemplate;
  workspaceId: string;
}

export function UseTemplateDialog({
  template,
  workspaceId,
}: UseTemplateDialogProps) {
  const t = useTranslations("templates");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(template.name);
  const [error, setError] = useState<string | null>(null);
  const createFromTemplate = useCreateBoardFromTemplate();

  useEffect(() => {
    if (open) setName(template.name);
  }, [open, template.name]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setError(null);
    try {
      const board = await createFromTemplate.mutateAsync({
        workspaceId,
        input: { templateId: template.id, name: trimmed },
      });
      setOpen(false);
      router.push(`/boards/${board.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("createFailed"));
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setError(null);
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" className="w-full cursor-pointer">
          {t("useTemplate")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t("useTemplateTitle", { name: template.name })}</DialogTitle>
            <DialogDescription>{t("useTemplateDescription")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="template-board-name">{tCommon("name")}</Label>
              <Input
                id="template-board-name"
                autoFocus
                autoComplete="off"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={createFromTemplate.isPending || !name.trim()}
              className="w-full sm:w-auto"
            >
              {createFromTemplate.isPending ? (
                <>
                  <Loader2 className="me-2 size-4 animate-spin" />
                  {t("creating")}
                </>
              ) : (
                t("createBoard")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
