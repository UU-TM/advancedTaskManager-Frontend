"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Loader2, Plus } from "lucide-react";
import { useCreateCard } from "@/hooks/use-card";
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

type FormValues = { title: string };

interface CreateTaskDialogProps {
  boardId: string;
  columnId: string;
}

export function CreateTaskDialog({ boardId, columnId }: CreateTaskDialogProps) {
  const t = useTranslations("kanban");
  const tCommon = useTranslations("common");
  const tVal = useTranslations("validators");
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const createCard = useCreateCard();

  const formSchema = useMemo(
    () =>
      z.object({
        title: z
          .string()
          .trim()
          .min(1, tVal("titleRequired"))
          .max(120, tVal("titleMax")),
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
    defaultValues: { title: "" },
  });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      await createCard.mutateAsync({
        boardId,
        columnId,
        title: values.title,
      });
      reset();
      setOpen(false);
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message);
      } else {
        setServerError(t("createTaskFailed"));
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
          variant="ghost"
          size="sm"
          className="w-full cursor-pointer justify-start text-muted-foreground hover:text-foreground"
        >
          <Plus className="me-2 size-4" />
          {t("addTask")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{t("addTask")}</DialogTitle>
            <DialogDescription>{t("addTaskDescription")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {serverError && (
              <Alert variant="destructive">
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="task-title">{tCommon("title")}</Label>
              <Input
                id="task-title"
                placeholder={t("taskTitlePlaceholder")}
                autoComplete="off"
                aria-invalid={!!errors.title}
                {...register("title")}
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting || createCard.isPending} className="w-full sm:w-auto">
              {isSubmitting || createCard.isPending ? (
                <>
                  <Loader2 className="me-2 size-4 animate-spin" />
                  {t("adding")}
                </>
              ) : (
                t("addTask")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
