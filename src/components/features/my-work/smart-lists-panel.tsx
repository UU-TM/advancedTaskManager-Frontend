"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Filter, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  useCreateSmartList,
  useDeleteSmartList,
  useSmartLists,
} from "@/hooks/use-smart-lists";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function SmartListsPanel() {
  const t = useTranslations("smartLists");
  const { data: lists = [], isLoading } = useSmartLists();
  const createList = useCreateSmartList();
  const deleteList = useDeleteSmartList();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  return (
    <section className="space-y-3 rounded-[18px] border border-border/80 bg-card p-6 text-card-foreground shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_24px_60px_-28px_rgba(0,0,0,0.28)]">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Filter className="size-4 text-primary" />
          {t("title")}
        </h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="cursor-pointer">
              <Plus className="me-1 size-3.5" />
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
                if (!name.trim()) return;
                createList.mutate(
                  {
                    name: name.trim(),
                    filters: { assignee: "me", archived: false },
                  },
                  {
                    onSuccess: () => {
                      toast.success(t("created"));
                      setOpen(false);
                      setName("");
                    },
                    onError: () => toast.error(t("createFailed")),
                  },
                );
              }}
            >
              <div className="space-y-1.5">
                <Label htmlFor="sl-name">{t("name")}</Label>
                <Input
                  id="sl-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">{t("filterHint")}</p>
              <Button type="submit" disabled={createList.isPending}>
                {t("create")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && <Skeleton className="h-10 w-full" />}
      {!isLoading && lists.length === 0 && (
        <p className="text-sm text-muted-foreground">{t("empty")}</p>
      )}
      <ul className="divide-y divide-border overflow-hidden rounded-md border border-border bg-card">
        {lists.map((list) => (
          <li
            key={list.id}
            className="flex items-center gap-3 px-4 py-2.5"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{list.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {JSON.stringify(list.filters)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-destructive"
              onClick={() =>
                deleteList.mutate(list.id, {
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
    </section>
  );
}
