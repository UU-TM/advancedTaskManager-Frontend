"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useUpdateBoardSettings } from "@/hooks/use-boards";
import type { Board, BoardPrefs } from "@/types/domain";
import { PanelFrame } from "./panel-frame";

export function SettingsPanel({
  board,
  onBack,
}: {
  board: Board;
  onBack: () => void;
}) {
  const t = useTranslations("kanban.boardMenu.settings");
  const update = useUpdateBoardSettings(board.id);
  const prefs: BoardPrefs = board.prefs ?? {};

  function patch(next: Partial<BoardPrefs>) {
    update.mutate(
      { prefs: { ...prefs, ...next } },
      {
        onSuccess: () => toast.success(t("saved")),
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
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5">
            <Label htmlFor="board-pref-label-text">{t("showLabelText")}</Label>
            <p className="text-xs text-muted-foreground">
              {t("showLabelTextHelp")}
            </p>
          </div>
          <Switch
            id="board-pref-label-text"
            checked={!!prefs.showLabelText}
            disabled={update.isPending}
            onCheckedChange={(showLabelText) => patch({ showLabelText })}
          />
        </div>

        <div className="space-y-2">
          <Label>{t("coverSize")}</Label>
          <ToggleGroup
            type="single"
            variant="outline"
            value={prefs.coverSize ?? "normal"}
            disabled={update.isPending}
            onValueChange={(v) => {
              if (v === "normal" || v === "full") patch({ coverSize: v });
            }}
            className="justify-start"
          >
            <ToggleGroupItem value="normal" className="cursor-pointer px-3">
              {t("coverNormal")}
            </ToggleGroupItem>
            <ToggleGroupItem value="full" className="cursor-pointer px-3">
              {t("coverFull")}
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
    </PanelFrame>
  );
}
