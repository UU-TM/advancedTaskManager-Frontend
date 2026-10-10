"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { LayoutGrid, Loader2, Plus, Presentation } from "lucide-react";
import { useCreateBoard } from "@/hooks/use-boards";
import { ApiError } from "@/lib/api";
import type { BoardKind } from "@/types/domain";
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
import { cn } from "@/lib/utils";

type FormValues = { name: string; kind: BoardKind };

interface CreateBoardDialogProps {
  workspaceId: string;
  /** Custom trigger; defaults to the boards “Create” button. */
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateBoardDialog({
  workspaceId,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: CreateBoardDialogProps) {
  const t = useTranslations("boards");
  const tCommon = useTranslations("common");
  const tVal = useTranslations("validators");
  const router = useRouter();
  const queryClient = useQueryClient();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;
  const [serverError, setServerError] = useState<string | null>(null);
  const createBoard = useCreateBoard();

  const formSchema = useMemo(
    () =>
      z.object({
        name: z
          .string()
          .trim()
          .min(1, tVal("nameRequired"))
          .max(64, tVal("boardNameMax")),
        kind: z.enum(["KANBAN", "WHITEBOARD"]),
      }),
    [tVal],
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", kind: "KANBAN" },
  });

  const kind = watch("kind");

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      const board = await createBoard.mutateAsync({
        workspaceId,
        name: values.name,
        kind: values.kind,
      });
      queryClient.setQueryData(["board", board.id], board);
      reset();
      setOpen(false);
      router.push(`/boards/${board.id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message);
      } else {
        setServerError(t("createFailed"));
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
        {trigger ?? (
          <Button className="cursor-pointer">
            <Plus className="me-2 size-4" />
            {t("create")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{t("createTitle")}</DialogTitle>
            <DialogDescription>{t("createDescription")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {serverError && (
              <Alert variant="destructive">
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="board-name">{tCommon("name")}</Label>
              <Input
                id="board-name"
                placeholder={t("namePlaceholder")}
                autoComplete="off"
                autoFocus
                aria-invalid={!!errors.name}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>{t("kindLabel")}</Label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    {
                      value: "KANBAN" as const,
                      icon: LayoutGrid,
                      title: t("kindKanban"),
                      desc: t("kindKanbanDesc"),
                    },
                    {
                      value: "WHITEBOARD" as const,
                      icon: Presentation,
                      title: t("kindWhiteboard"),
                      desc: t("kindWhiteboardDesc"),
                    },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setValue("kind", opt.value)}
                    className={cn(
                      "flex flex-col items-start gap-1 rounded-md border p-3 text-start transition-colors",
                      kind === opt.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50",
                    )}
                  >
                    <opt.icon className="size-4 text-primary" />
                    <span className="text-sm font-medium">{opt.title}</span>
                    <span className="text-xs text-muted-foreground">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={isSubmitting || createBoard.isPending}
              className="w-full sm:w-auto"
            >
              {isSubmitting || createBoard.isPending ? (
                <>
                  <Loader2 className="me-2 size-4 animate-spin" />
                  {t("creating")}
                </>
              ) : (
                t("create")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
