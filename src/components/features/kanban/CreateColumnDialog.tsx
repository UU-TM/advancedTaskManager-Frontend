"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

const formSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(40, "Column name is too long"),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateColumnDialogProps {
  boardId: string;
}

export function CreateColumnDialog({ boardId }: CreateColumnDialogProps) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const createColumn = useCreateColumn();

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
        setServerError("Could not create column. Please try again.");
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
        <Button variant="outline" className="w-32 shrink-0 border-dashed ">
          <Plus className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Add column</DialogTitle>
            <DialogDescription>
              Give the new column a name.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {serverError && (
              <Alert variant="destructive">
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="column-name">Name</Label>
              <Input
                id="column-name"
                placeholder="To do"
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
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Adding…
                </>
              ) : (
                "Add column"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}