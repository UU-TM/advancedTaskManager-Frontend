"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useCreateCard } from "@/hooks/use-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function InlineCardComposer({
  boardId,
  columnId,
  onCreated,
}: {
  boardId: string;
  columnId: string;
  onCreated?: () => void;
}) {
  const t = useTranslations("kanban");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const createCard = useCreateCard();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  function close() {
    setTitle("");
    setOpen(false);
  }

  async function submit() {
    const next = title.trim();
    if (!next) return;
    setTitle("");
    inputRef.current?.focus();
    onCreated?.();
    requestAnimationFrame(() => onCreated?.());
    try {
      await createCard.mutateAsync({ boardId, columnId, title: next });
      onCreated?.();
    } catch {
      toast.error(t("createTaskFailed"));
      setTitle(next);
    }
    inputRef.current?.focus();
  }

  if (!open) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 w-full justify-start rounded-lg px-2 font-normal text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
        onClick={() => setOpen(true)}
      >
        <Plus className="size-4" />
        {t("addTask")}
      </Button>
    );
  }

  return (
    <div ref={rootRef} className="space-y-2">
      <Textarea
        ref={inputRef}
        autoFocus
        value={title}
        rows={2}
        placeholder={t("taskTitlePlaceholder")}
        aria-label={t("addTask")}
        className="min-h-14 resize-none rounded-lg border-0 bg-card text-sm shadow-[var(--kanban-card-shadow)] focus-visible:ring-1"
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            void submit();
          }
          if (e.key === "Escape") close();
        }}
        onBlur={(e) => {
          const next = e.relatedTarget;
          if (next instanceof Node && rootRef.current?.contains(next)) return;
          if (!title.trim()) setOpen(false);
        }}
      />
      <div className="flex items-center gap-1">
        <Button
          type="button"
          size="sm"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => void submit()}
        >
          {tCommon("add")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={tCommon("cancel")}
          onMouseDown={(e) => e.preventDefault()}
          onClick={close}
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}
