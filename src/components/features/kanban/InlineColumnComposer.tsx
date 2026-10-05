"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useCreateColumn } from "@/hooks/use-columns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function InlineColumnComposer({
  boardId,
  defaultOpen = false,
}: {
  boardId: string;
  defaultOpen?: boolean;
}) {
  const t = useTranslations("kanban");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(defaultOpen);
  const [name, setName] = useState("");
  const createColumn = useCreateColumn();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function close() {
    setName("");
    setOpen(false);
  }

  async function submit() {
    const next = name.trim();
    if (!next) return;
    setName("");
    inputRef.current?.focus();
    try {
      await createColumn.mutateAsync({ boardId, name: next });
      rootRef.current?.scrollIntoView({
        inline: "end",
        block: "nearest",
        behavior: "smooth",
      });
    } catch {
      toast.error(t("createColumnFailed"));
      setName(next);
    }
    inputRef.current?.focus();
  }

  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        className="h-auto w-72 shrink-0 cursor-pointer justify-start border-dashed py-3 text-muted-foreground hover:border-primary/40 hover:text-foreground"
        onClick={() => setOpen(true)}
      >
        <Plus className="size-4" />
        {t("addColumn")}
      </Button>
    );
  }

  return (
    <div
      ref={rootRef}
      className="w-72 shrink-0 rounded-xl border border-border bg-muted/50 p-2"
    >
      <Input
        ref={inputRef}
        autoFocus
        value={name}
        placeholder={t("columnNamePlaceholder")}
        aria-label={t("addColumn")}
        autoComplete="off"
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            void submit();
          }
          if (e.key === "Escape") close();
        }}
        onBlur={(e) => {
          const next = e.relatedTarget;
          if (next instanceof Node && rootRef.current?.contains(next)) return;
          if (!name.trim()) setOpen(false);
        }}
      />
      <div className="mt-2 flex items-center gap-1">
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
