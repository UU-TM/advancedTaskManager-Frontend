"use client";

import { useState, type ComponentType } from "react";
import {
  ArrowRightLeft,
  Archive,
  ChevronRight,
  Crown,
  Image as ImageIcon,
  LayoutTemplate,
  Menu,
  Settings2,
  Tag,
  Puzzle,
  Zap,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useActiveWorkspace } from "@/components/layout/active-workspace-context";
import { cn } from "@/lib/utils";
import type { Board } from "@/types/domain";
import {
  BoardManageDialogs,
  useBoardManageDialogsState,
  useCanManageBoard,
} from "./BoardManageMenu";
import { ArchivedPanel } from "./board-menu/archived-panel";
import { BackgroundPanel } from "./board-menu/background-panel";
import { LabelsPanel } from "./board-menu/labels-panel";
import { PowerUpsPanel } from "./board-menu/power-ups-panel";
import { SettingsPanel } from "./board-menu/settings-panel";

export type BoardMenuPanel =
  | "main"
  | "background"
  | "labels"
  | "archived"
  | "powerUps"
  | "settings";

type BoardMenuSheetProps = {
  board: Board;
  /** Optional: show a Butler row that hands off to the automations UI. */
  onOpenButler?: () => void;
};

type MenuRowProps = {
  icon: ComponentType<{ className?: string }>;
  label: string;
  hint?: string;
  disabled?: boolean;
  onClick: () => void;
};

function MenuRow({ icon: Icon, label, hint, disabled, onClick }: MenuRowProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-start text-sm transition-colors",
        "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
      )}
    >
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{label}</span>
        {hint && (
          <span className="block truncate text-xs text-muted-foreground">
            {hint}
          </span>
        )}
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground rtl:rotate-180" />
    </button>
  );
}

function MenuSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-1">
      <h3 className="px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
  );
}

/** Trello-style board menu: background, labels, archive, Power-Ups, settings. */
export function BoardMenuSheet({ board, onOpenButler }: BoardMenuSheetProps) {
  const t = useTranslations("kanban.boardMenu");
  const tTemplates = useTranslations("templates");
  const tWorkspace = useTranslations("workspace");
  const { workspaces } = useActiveWorkspace();
  const canManage = useCanManageBoard(board);
  const dialogs = useBoardManageDialogsState();

  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<BoardMenuPanel>("main");

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setPanel("main");
  }

  const back = () => setPanel("main");
  const otherWorkspaces = workspaces.filter((w) => w.id !== board.workspaceId);

  function closeThen(fn: () => void) {
    handleOpenChange(false);
    // Let the sheet unmount its focus trap before opening a dialog / sheet.
    window.setTimeout(fn, 0);
  }

  return (
    <>
      {canManage && <BoardManageDialogs board={board} state={dialogs} />}
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon-sm"
            className="cursor-pointer"
            aria-label={t("open")}
            title={t("open")}
          >
            <Menu className="size-4" />
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full gap-0 p-0 sm:max-w-sm">
          {panel === "main" && (
            <>
              <SheetHeader className="border-b border-border">
                <SheetTitle>{t("title")}</SheetTitle>
                <SheetDescription>{t("description")}</SheetDescription>
              </SheetHeader>
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-2 pb-6">
                <MenuSection title={t("sections.customize")}>
                  <MenuRow
                    icon={ImageIcon}
                    label={t("items.background")}
                    onClick={() => setPanel("background")}
                  />
                  <MenuRow
                    icon={Tag}
                    label={t("items.labels")}
                    onClick={() => setPanel("labels")}
                  />
                  <MenuRow
                    icon={Settings2}
                    label={t("items.settings")}
                    onClick={() => setPanel("settings")}
                  />
                </MenuSection>

                <MenuSection title={t("sections.manage")}>
                  <MenuRow
                    icon={Archive}
                    label={t("items.archived")}
                    onClick={() => setPanel("archived")}
                  />
                  <MenuRow
                    icon={Puzzle}
                    label={t("items.powerUps")}
                    onClick={() => setPanel("powerUps")}
                  />
                  {onOpenButler && (
                    <MenuRow
                      icon={Zap}
                      label={t("items.butler")}
                      hint={t("butler.hint")}
                      onClick={() => closeThen(onOpenButler)}
                    />
                  )}
                </MenuSection>

                {canManage && (
                  <MenuSection title={t("sections.admin")}>
                    <MenuRow
                      icon={LayoutTemplate}
                      label={tTemplates("saveAsTemplate")}
                      onClick={() => closeThen(() => dialogs.setTemplateOpen(true))}
                    />
                    <MenuRow
                      icon={Crown}
                      label={tWorkspace("transferOwnership")}
                      onClick={() => closeThen(() => dialogs.setTransferOpen(true))}
                    />
                    <MenuRow
                      icon={ArrowRightLeft}
                      label={tWorkspace("moveBoard")}
                      disabled={otherWorkspaces.length === 0}
                      onClick={() => closeThen(() => dialogs.setMoveOpen(true))}
                    />
                  </MenuSection>
                )}
              </div>
            </>
          )}

          {panel === "background" && (
            <BackgroundPanel board={board} onBack={back} />
          )}
          {panel === "labels" && <LabelsPanel boardId={board.id} onBack={back} />}
          {panel === "archived" && (
            <ArchivedPanel boardId={board.id} onBack={back} />
          )}
          {panel === "powerUps" && (
            <PowerUpsPanel boardId={board.id} onBack={back} />
          )}
          {panel === "settings" && (
            <SettingsPanel board={board} onBack={back} />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
