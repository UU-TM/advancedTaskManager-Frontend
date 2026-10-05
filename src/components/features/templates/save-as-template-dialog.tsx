"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, LayoutTemplate } from "lucide-react";
import { toast } from "sonner";
import { useSaveAsTemplate } from "@/hooks/use-templates";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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

interface SaveAsTemplateDialogProps {
  boardId: string;
  boardName: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
}

export function SaveAsTemplateDialog({
  boardId,
  boardName,
  open: controlledOpen,
  onOpenChange,
  showTrigger = true,
}: SaveAsTemplateDialogProps) {
  const t = useTranslations("templates");
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [includeCards, setIncludeCards] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const saveAsTemplate = useSaveAsTemplate();

  function reset() {
    setName("");
    setDescription("");
    setCategory("");
    setIncludeCards(true);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setError(null);
    try {
      await saveAsTemplate.mutateAsync({
        boardId,
        input: {
          name: trimmed,
          description: description.trim() || undefined,
          category: category.trim() || undefined,
          includeCards,
        },
      });
      toast.success(t("saveSuccess"));
      setOpen(false);
      reset();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("saveFailed"));
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setName((prev) => prev || `${boardName} template`);
        else reset();
      }}
    >
      {showTrigger && (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="cursor-pointer">
            <LayoutTemplate className="me-2 size-4" />
            {t("saveAsTemplate")}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t("saveAsTemplateTitle")}</DialogTitle>
            <DialogDescription>{t("saveAsTemplateDescription")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="save-template-name">{t("name")}</Label>
              <Input
                id="save-template-name"
                autoFocus
                autoComplete="off"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="save-template-description">{t("description")}</Label>
              <Textarea
                id="save-template-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("descriptionPlaceholder")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="save-template-category">{t("category")}</Label>
              <Input
                id="save-template-category"
                autoComplete="off"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder={t("categoryPlaceholder")}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={includeCards}
                onCheckedChange={(checked) => setIncludeCards(!!checked)}
              />
              {t("includeCards")}
            </label>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={saveAsTemplate.isPending || !name.trim()}
              className="w-full sm:w-auto"
            >
              {saveAsTemplate.isPending ? (
                <>
                  <Loader2 className="me-2 size-4 animate-spin" />
                  {t("saving")}
                </>
              ) : (
                t("saveAsTemplate")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
