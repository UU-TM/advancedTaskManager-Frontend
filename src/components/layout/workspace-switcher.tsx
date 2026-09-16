"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Check, ChevronsUpDown, Plus, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { useActiveWorkspace } from "./active-workspace-context";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type WorkspaceSwitcherProps = {
  onInteractionLockChange?: (locked: boolean) => void;
  className?: string;
  triggerClassName?: string;
  rtl?: boolean;
};

export function WorkspaceSwitcher({
  onInteractionLockChange,
  className,
  triggerClassName,
  rtl = false,
}: WorkspaceSwitcherProps) {
  const t = useTranslations("workspace");
  const {
    workspace,
    workspaces,
    setWorkspaceId,
    createWorkspace,
    isLoading,
  } = useActiveWorkspace();
  const [menuOpen, setMenuOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    onInteractionLockChange?.(menuOpen || createOpen);
  }, [menuOpen, createOpen, onInteractionLockChange]);

  async function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setCreating(true);
    try {
      await createWorkspace(trimmed);
      setCreateOpen(false);
      setName("");
      toast.success(t("created"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("createFailed"));
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className={className}>
      <DropdownMenu modal={false} open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "h-10 w-full gap-2 rounded-xl px-3 font-medium",
              rtl ? "flex-row-reverse" : "flex-row",
              triggerClassName,
            )}
            disabled={mounted && isLoading && !workspace}
          >
            <span
              className={cn(
                "min-w-0 flex-1 truncate",
                rtl ? "text-right" : "text-left",
              )}
            >
              {mounted ? (workspace?.name ?? t("loading")) : t("loading")}
            </span>
            <ChevronsUpDown className="size-3.5 shrink-0 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align={rtl ? "end" : "start"}
          className="w-56"
        >
          <DropdownMenuLabel className={rtl ? "text-right" : undefined}>
            {t("switcherLabel")}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {workspaces.map((w) => (
            <DropdownMenuItem
              key={w.id}
              onClick={() => setWorkspaceId(w.id)}
              className={cn(
                "flex items-center gap-2",
                rtl && "flex-row-reverse",
                w.id === workspace?.id && "bg-muted",
              )}
            >
              <span
                className={cn(
                  "min-w-0 flex-1 truncate",
                  rtl ? "text-right" : "text-left",
                )}
              >
                {w.name}
              </span>
              {w.id === workspace?.id && (
                <Check className="size-3.5 shrink-0 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setCreateOpen(true)}
            className={cn("flex items-center gap-2", rtl && "flex-row-reverse")}
          >
            <Plus className="size-3.5" />
            {t("create")}
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href="/workspace"
              className={cn(
                "flex items-center gap-2",
                rtl && "flex-row-reverse",
              )}
            >
              <Settings2 className="size-3.5" />
              {t("manage")}
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md" dir={rtl ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle>{t("createTitle")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="ws-name">{t("name")}</Label>
            <Input
              id="ws-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("namePlaceholder")}
              className={rtl ? "text-right" : undefined}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleCreate();
              }}
            />
          </div>
          <DialogFooter className={rtl ? "flex-row-reverse sm:flex-row-reverse" : undefined}>
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
              disabled={creating}
            >
              {t("cancel")}
            </Button>
            <Button
              onClick={() => void handleCreate()}
              disabled={creating || !name.trim()}
            >
              {t("create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
