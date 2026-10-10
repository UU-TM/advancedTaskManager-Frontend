"use client";

import { useState } from "react";
import { Check, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDelete } from "@/components/ui/confirm-delete";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useBoardLabels,
  useCreateLabel,
  useDeleteLabel,
  useUpdateLabel,
} from "@/hooks/use-kanban-extras";
import { LABEL_PRESET_COLORS } from "@/components/features/kanban/priority";
import { cn } from "@/lib/utils";
import type { Label } from "@/types/domain";
import { PanelFrame } from "./panel-frame";

function ColorPicker({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}) {
  const t = useTranslations("kanban.boardMenu.labels");
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label={t("color")}>
      {LABEL_PRESET_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          disabled={disabled}
          aria-label={color}
          aria-pressed={value.toLowerCase() === color.toLowerCase()}
          onClick={() => onChange(color)}
          className={cn(
            "flex size-6 cursor-pointer items-center justify-center rounded-md text-white transition-transform hover:scale-110",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-60",
          )}
          style={{ backgroundColor: color }}
        >
          {value.toLowerCase() === color.toLowerCase() && (
            <Check className="size-3.5" />
          )}
        </button>
      ))}
    </div>
  );
}

function LabelRow({ label, boardId }: { label: Label; boardId: string }) {
  const t = useTranslations("kanban.boardMenu.labels");
  const update = useUpdateLabel(boardId);
  const remove = useDeleteLabel(boardId);
  const [name, setName] = useState(label.name);

  const dirty = name.trim() !== label.name && name.trim().length > 0;

  function save(patch: { name?: string; color?: string }) {
    update.mutate(
      { id: label.id, ...patch },
      {
        onSuccess: () => toast.success(t("updated")),
        onError: () => toast.error(t("failed")),
      },
    );
  }

  return (
    <li className="space-y-2 rounded-md border border-border/70 bg-card p-2.5">
      <div className="flex items-center gap-2">
        <span
          className="size-5 shrink-0 rounded-md"
          style={{ backgroundColor: label.color }}
          aria-hidden
        />
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && dirty) save({ name: name.trim() });
          }}
          className="h-8"
          aria-label={t("namePlaceholder")}
        />
        {dirty && (
          <Button
            type="button"
            size="sm"
            className="cursor-pointer"
            disabled={update.isPending}
            onClick={() => save({ name: name.trim() })}
          >
            {t("save")}
          </Button>
        )}
        <ConfirmDelete
          title={t("deleteTitle")}
          description={t("deleteDescription")}
          onConfirm={() =>
            remove.mutate(label.id, {
              onSuccess: () => toast.success(t("deleted")),
              onError: () => toast.error(t("failed")),
            })
          }
        >
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="cursor-pointer text-muted-foreground hover:text-destructive"
            aria-label={t("deleteTitle")}
          >
            <Trash2 className="size-4" />
          </Button>
        </ConfirmDelete>
      </div>
      <ColorPicker
        value={label.color}
        disabled={update.isPending}
        onChange={(color) => {
          if (color.toLowerCase() !== label.color.toLowerCase()) save({ color });
        }}
      />
    </li>
  );
}

export function LabelsPanel({
  boardId,
  onBack,
}: {
  boardId: string;
  onBack: () => void;
}) {
  const t = useTranslations("kanban.boardMenu.labels");
  const { data: labels = [], isLoading } = useBoardLabels(boardId);
  const create = useCreateLabel(boardId);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState<string>(LABEL_PRESET_COLORS[4]);

  function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    create.mutate(
      { name, color: newColor },
      {
        onSuccess: () => {
          setNewName("");
          toast.success(t("created"));
        },
        onError: () => toast.error(t("failed")),
      },
    );
  }

  return (
    <PanelFrame
      title={t("title")}
      description={t("description")}
      onBack={onBack}
    >
      <div className="space-y-5 pt-4">
        <ul className="space-y-2">
          {isLoading && (
            <>
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </>
          )}
          {!isLoading && labels.length === 0 && (
            <li className="text-sm text-muted-foreground">{t("empty")}</li>
          )}
          {labels.map((label) => (
            <LabelRow
              key={`${label.id}:${label.name}:${label.color}`}
              label={label}
              boardId={boardId}
            />
          ))}
        </ul>

        <section className="space-y-2 rounded-md border border-dashed border-border p-3">
          <h3 className="text-sm font-medium">{t("new")}</h3>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
            }}
            placeholder={t("namePlaceholder")}
            className="h-8"
          />
          <ColorPicker value={newColor} onChange={setNewColor} />
          <Button
            type="button"
            size="sm"
            className="cursor-pointer"
            disabled={!newName.trim() || create.isPending}
            onClick={handleCreate}
          >
            {t("create")}
          </Button>
        </section>
      </div>
    </PanelFrame>
  );
}
