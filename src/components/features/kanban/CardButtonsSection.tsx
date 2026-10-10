"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAutomations, useRunAutomation } from "@/hooks/use-automations";

type CardButtonsSectionProps = {
  boardId: string;
  cardId: string;
};

/** Butler card buttons — run an automation against the open card. */
export function CardButtonsSection({ boardId, cardId }: CardButtonsSectionProps) {
  const t = useTranslations("butler");
  const { data: automations = [] } = useAutomations(boardId);
  const run = useRunAutomation(boardId);

  const buttons = automations.filter(
    (a) => a.kind === "CARD_BUTTON" && a.enabled,
  );
  if (buttons.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">
        {t("cardButtonsTitle")}
      </p>
      <div className="flex flex-wrap gap-2">
        {buttons.map((a) => (
          <Button
            key={a.id}
            size="sm"
            variant="outline"
            className="cursor-pointer"
            disabled={run.isPending}
            onClick={() =>
              run.mutate(
                { id: a.id, cardId },
                {
                  onSuccess: (res) =>
                    toast.success(t("ran", { count: res.actionsRun })),
                  onError: () => toast.error(t("runFailed")),
                },
              )
            }
          >
            <Play className="size-3.5" />
            {a.buttonLabel || a.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
