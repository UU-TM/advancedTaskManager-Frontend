"use client";

import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useBoardPowerUps, usePowerUpMutations } from "@/hooks/use-power-ups";
import { snapshotKey } from "@/lib/power-up-keys";
import type { BoardPowerUp } from "@/types/domain";
import { PanelFrame } from "./panel-frame";

const POWER_UP_IDS: Record<string, string> = {
  "custom-fields": "customFields",
  map: "map",
  stickers: "stickers",
  dashboard: "dashboard",
  github: "github",
  calendar: "calendar",
  timeline: "timeline",
  "time-tracking": "timeTracking",
  dependencies: "dependencies",
  "suggest-next": "suggestNext",
  "nl-search": "nlSearch",
};

export function PowerUpsPanel({
  boardId,
  onBack,
}: {
  boardId: string;
  onBack: () => void;
}) {
  const t = useTranslations("kanban.boardMenu.powerUps");
  const { data: powerUps = [], isLoading, isError } = useBoardPowerUps(boardId);
  const label = (powerUp: BoardPowerUp, group: "names" | "descriptions") => {
    const id = POWER_UP_IDS[snapshotKey(powerUp.snapshot) ?? ""];
    const key = id ? `${group}.${id}` : "";
    if (key && t.has(key)) return t(key);
    return group === "names" ? powerUp.name : powerUp.description;
  };
  const { enable, toggle, disable } = usePowerUpMutations(boardId);
  const busy = enable.isPending || toggle.isPending || disable.isPending;

  return (
    <PanelFrame
      title={t("title")}
      description={t("description")}
      onBack={onBack}
    >
      <div className="space-y-2 pt-4">
        {isLoading && (
          <>
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </>
        )}
        {isError && (
          <p className="text-sm text-destructive">{t("loadFailed")}</p>
        )}
        {!isLoading && !isError && powerUps.length === 0 && (
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        )}
        <ul className="space-y-2">
          {powerUps.map((pu) => (
            <li
              key={pu.packId}
              className="space-y-2 rounded-md border border-border/70 bg-card p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium" dir="auto">
                    {label(pu, "names")}
                  </p>
                  {label(pu, "descriptions") && (
                    <p
                      className="mt-0.5 line-clamp-2 text-xs text-muted-foreground"
                      dir="auto"
                    >
                      {label(pu, "descriptions")}
                    </p>
                  )}
                </div>
                {pu.attached && (
                  <Badge variant={pu.enabled ? "default" : "secondary"}>
                    {pu.enabled ? t("enabled") : t("disabled")}
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between gap-2">
                {pu.attached ? (
                  <>
                    <Switch
                      checked={pu.enabled}
                      disabled={busy}
                      aria-label={label(pu, "names")}
                      onCheckedChange={(enabled) =>
                        toggle.mutate(
                          { packId: pu.packId, enabled },
                          {
                            onSuccess: () => toast.success(t("toggled")),
                            onError: () => toast.error(t("failed")),
                          },
                        )
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="cursor-pointer text-muted-foreground hover:text-destructive"
                      disabled={busy}
                      onClick={() =>
                        disable.mutate(pu.packId, {
                          onSuccess: () => toast.success(t("removed")),
                          onError: () => toast.error(t("failed")),
                        })
                      }
                    >
                      <Trash2 className="me-1.5 size-3.5" />
                      {t("remove")}
                    </Button>
                  </>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="ms-auto cursor-pointer"
                    disabled={busy}
                    onClick={() =>
                      enable.mutate(pu.packId, {
                        onSuccess: () => toast.success(t("added")),
                        onError: () => toast.error(t("failed")),
                      })
                    }
                  >
                    <Plus className="me-1.5 size-3.5" />
                    {t("add")}
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </PanelFrame>
  );
}
