"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAutomations, useRunAutomation } from "@/hooks/use-automations";

/** Board-level Butler buttons rendered as small header actions. */
export function BoardButtonsBar({ boardId }: { boardId: string }) {
  const t = useTranslations("butler");
  const { data: automations = [] } = useAutomations(boardId);
  const run = useRunAutomation(boardId);

  const buttons = automations.filter(
    (a) => a.kind === "BOARD_BUTTON" && a.enabled,
  );
  if (buttons.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {buttons.map((a) => (
        <Button
          key={a.id}
          size="sm"
          variant="secondary"
          className="h-7 cursor-pointer gap-1 px-2 text-xs"
          disabled={run.isPending}
          onClick={() =>
            run.mutate(
              { id: a.id },
              {
                onSuccess: (res) =>
                  toast.success(t("ran", { count: res.actionsRun })),
                onError: () => toast.error(t("runFailed")),
              },
            )
          }
        >
          <Play className="size-3" />
          {a.buttonLabel || a.name}
        </Button>
      ))}
    </div>
  );
}
