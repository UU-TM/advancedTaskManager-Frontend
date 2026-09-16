"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ClipboardList, ExternalLink, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useActiveWorkspace } from "@/components/layout/active-workspace-context";
import { useBoards } from "@/hooks/use-boards";
import { useColumns } from "@/hooks/use-columns";
import {
  useCreateIntakeForm,
  useDeleteIntakeForm,
  useIntakeForms,
} from "@/hooks/use-intake-forms";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

export function FormsPageView() {
  const t = useTranslations("forms");
  const { workspaceId } = useActiveWorkspace();
  const { data: forms = [], isLoading, isError } = useIntakeForms(workspaceId);
  const { data: boards = [] } = useBoards(workspaceId);
  const createForm = useCreateIntakeForm(workspaceId ?? "");
  const deleteForm = useDeleteIntakeForm(workspaceId ?? "");

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [boardId, setBoardId] = useState("");
  const [columnId, setColumnId] = useState("");
  const { data: columns = [] } = useColumns(boardId || undefined);

  const canCreate = useMemo(
    () =>
      !!workspaceId &&
      name.trim().length > 0 &&
      slugify(slug || name).length >= 2 &&
      !!boardId &&
      !!columnId,
    [workspaceId, name, slug, boardId, columnId],
  );

  function reset() {
    setName("");
    setSlug("");
    setBoardId("");
    setColumnId("");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-6 md:px-6">
      <PageHeader
        title={t("title")}
        description={t("subtitle")}
        actions={
          <Dialog
            open={open}
            onOpenChange={(v) => {
              setOpen(v);
              if (!v) reset();
            }}
          >
            <DialogTrigger asChild>
              <Button className="cursor-pointer" disabled={!workspaceId}>
                <Plus className="me-1.5 size-4" />
                {t("create")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("createTitle")}</DialogTitle>
              </DialogHeader>
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!workspaceId || !canCreate) return;
                  createForm.mutate(
                    {
                      name: name.trim(),
                      slug: slugify(slug || name),
                      boardId,
                      columnId,
                      fields: [
                        {
                          key: "title",
                          label: "Title",
                          type: "text",
                          required: true,
                        },
                        {
                          key: "description",
                          label: "Description",
                          type: "textarea",
                        },
                      ],
                      enabled: true,
                    },
                    {
                      onSuccess: () => {
                        toast.success(t("created"));
                        setOpen(false);
                        reset();
                      },
                      onError: () => toast.error(t("createFailed")),
                    },
                  );
                }}
              >
                <div className="space-y-2">
                  <Label>{t("name")}</Label>
                  <Input
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!slug) setSlug(slugify(e.target.value));
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("slug")}</Label>
                  <Input
                    value={slug}
                    onChange={(e) => setSlug(slugify(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("board")}</Label>
                  <Select
                    value={boardId}
                    onValueChange={(v) => {
                      setBoardId(v);
                      setColumnId("");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectBoard")} />
                    </SelectTrigger>
                    <SelectContent>
                      {boards.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("column")}</Label>
                  <Select
                    value={columnId}
                    onValueChange={setColumnId}
                    disabled={!boardId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectColumn")} />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  className="w-full cursor-pointer"
                  disabled={!canCreate || createForm.isPending}
                >
                  {t("create")}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {!workspaceId && (
        <EmptyState
          icon={ClipboardList}
          title={t("noWorkspace")}
          description={t("noWorkspaceBody")}
        />
      )}

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      )}

      {isError && (
        <EmptyState
          icon={ClipboardList}
          title={t("errorTitle")}
          description={t("errorBody")}
        />
      )}

      {!isLoading && forms.length === 0 && workspaceId && (
        <EmptyState
          icon={ClipboardList}
          title={t("emptyTitle")}
          description={t("emptyBody")}
        />
      )}

      {forms.length > 0 && (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {forms.map((form) => (
            <li
              key={form.id}
              className="flex flex-wrap items-center gap-3 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium">{form.name}</p>
                <p className="text-xs text-muted-foreground">/{form.slug}</p>
              </div>
              <Badge variant={form.enabled ? "secondary" : "outline"}>
                {form.enabled ? t("enabled") : t("disabled")}
              </Badge>
              <Button asChild size="sm" variant="outline" className="cursor-pointer">
                <Link href={`/public/forms/${form.slug}`} target="_blank">
                  <ExternalLink className="me-1.5 size-3.5" />
                  {t("publicLink")}
                </Link>
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="cursor-pointer text-destructive"
                onClick={() =>
                  deleteForm.mutate(form.id, {
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
      )}
    </div>
  );
}
