"use client";

import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type PanelFrameProps = {
  title: string;
  description?: string;
  onBack: () => void;
  children: ReactNode;
};

/** Shared header (back button + title) for each board-menu sub-panel. */
export function PanelFrame({
  title,
  description,
  onBack,
  children,
}: PanelFrameProps) {
  const t = useTranslations("kanban.boardMenu");
  return (
    <>
      <SheetHeader className="border-b border-border">
        <div className="flex items-center gap-1 pe-8">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="cursor-pointer"
            aria-label={t("back")}
            title={t("back")}
            onClick={onBack}
          >
            <ChevronLeft className="size-4 rtl:rotate-180" />
          </Button>
          <SheetTitle>{title}</SheetTitle>
        </div>
        {description && <SheetDescription>{description}</SheetDescription>}
      </SheetHeader>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">{children}</div>
    </>
  );
}
