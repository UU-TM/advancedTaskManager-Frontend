"use client";

import { Check, ImageOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useUpdateBoardSettings } from "@/hooks/use-boards";
import {
  BOARD_COLOR_PRESETS,
  BOARD_IMAGE_PRESETS,
  type BoardBackgroundPreset,
} from "@/lib/board-background";
import { cn } from "@/lib/utils";
import type { Board } from "@/types/domain";
import { PanelFrame } from "./panel-frame";

type BackgroundPanelProps = {
  board: Board;
  onBack: () => void;
};

function Swatch({
  preset,
  selected,
  label,
  disabled,
  onSelect,
}: {
  preset: BoardBackgroundPreset;
  selected: boolean;
  label: string;
  disabled: boolean;
  onSelect: () => void;
}) {
  const isImage = preset.type === "IMAGE";
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={selected}
      aria-label={label}
      title={label}
      onClick={onSelect}
      className={cn(
        "relative h-14 cursor-pointer overflow-hidden rounded-md border border-border/70 transition-shadow",
        "hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-60",
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
      )}
      style={
        isImage
          ? {
              backgroundImage: preset.css,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : preset.type === "COLOR"
            ? { backgroundColor: preset.value }
            : { backgroundImage: preset.css }
      }
    >
      {selected && (
        <span className="absolute end-1 top-1 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
          <Check className="size-3" />
        </span>
      )}
    </button>
  );
}

export function BackgroundPanel({ board, onBack }: BackgroundPanelProps) {
  const t = useTranslations("kanban.boardMenu.background");
  const update = useUpdateBoardSettings(board.id);

  function apply(preset: BoardBackgroundPreset) {
    update.mutate(
      { backgroundType: preset.type, backgroundValue: preset.value },
      {
        onSuccess: () => toast.success(t("updated")),
        onError: () => toast.error(t("failed")),
      },
    );
  }

  function clear() {
    update.mutate(
      { backgroundType: null, backgroundValue: null },
      {
        onSuccess: () => toast.success(t("removed")),
        onError: () => toast.error(t("failed")),
      },
    );
  }

  const sections: { key: string; title: string; presets: BoardBackgroundPreset[] }[] =
    [
      { key: "colors", title: t("colors"), presets: BOARD_COLOR_PRESETS },
      { key: "images", title: t("images"), presets: BOARD_IMAGE_PRESETS },
    ];

  return (
    <PanelFrame
      title={t("title")}
      description={t("description")}
      onBack={onBack}
    >
      <div className="space-y-5 pt-4">
        {sections.map((section) => (
          <section key={section.key} className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {section.title}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {section.presets.map((preset) => (
                <Swatch
                  key={`${preset.type}-${preset.id}`}
                  preset={preset}
                  label={t(`names.${preset.labelKey}`)}
                  selected={
                    board.backgroundType === preset.type &&
                    board.backgroundValue?.toLowerCase() ===
                      preset.value.toLowerCase()
                  }
                  disabled={update.isPending}
                  onSelect={() => apply(preset)}
                />
              ))}
            </div>
          </section>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full cursor-pointer"
          disabled={update.isPending || !board.backgroundType}
          onClick={clear}
        >
          <ImageOff className="me-2 size-4" />
          {t("remove")}
        </Button>
      </div>
    </PanelFrame>
  );
}
