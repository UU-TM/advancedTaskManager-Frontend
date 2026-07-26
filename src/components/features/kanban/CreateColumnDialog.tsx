"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Loader2, Plus } from "lucide-react";
import { useCreateColumn } from "@/hooks/use-columns";
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

type FormValues = { name: string };

interface CreateColumnDialogProps {
  boardId: string;
}

export function CreateColumnDialog({ boardId }: CreateColumnDialogProps) {
  const t = useTranslations("kanban");
  const tCommon = useTranslations("common");
  const tVal = useTranslations("validators");
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const createColumn = useCreateColumn();

  const formSchema = useMemo(
    () =>
      z.object({
        name: z
          .string()
          .trim()
          .min(1, tVal("nameRequired"))
          .max(40, tVal("columnNameMax")),
      }),
    [tVal],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "" },
  });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      await createColumn.mutateAsync({
        boardId,
        name: values.name,
      });
      reset();
      setOpen(false);
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message);
      } else {
        setServerError(t("createColumnFailed"));
      }
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setServerError(null);
          reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-auto w-72 shrink-0 cursor-pointer border-dashed py-3 text-muted-foreground hover:border-primary/40 hover:text-foreground"
        >
          <Plus className="me-2 size-4" />
          {t("addColumn")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{t("addColumn")}</DialogTitle>
            <DialogDescription>{t("addColumnDescription")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {serverError && (
              <Alert variant="destructive">
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="column-name">{tCommon("name")}</Label>
              <Input
                id="column-name"
                placeholder={t("columnNamePlaceholder")}
                autoComplete="off"
                aria-invalid={!!errors.name}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={isSubmitting || createColumn.isPending}
              className="w-full sm:w-auto"
            >
              {isSubmitting || createColumn.isPending ? (
                <>
                  <Loader2 className="me-2 size-4 animate-spin" />
                  {t("adding")}
                </>
              ) : (
                t("addColumn")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
