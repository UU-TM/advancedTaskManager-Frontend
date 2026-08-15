"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowRightLeft, Crown, MoreHorizontal } from "lucide-react";
import { boardsApi } from "@/lib/api";
import { useBoardMembers } from "@/hooks/use-kanban-extras";
import { useActiveWorkspace } from "@/components/layout/active-workspace-context";
import { useAuth } from "@/hooks/use-auth";
import { boardKeys } from "@/hooks/use-boards";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api";
import type { Board } from "@/types/domain";

type BoardManageMenuProps = {
  board: Board;
};

export function BoardManageMenu({ board }: BoardManageMenuProps) {
  const t = useTranslations("workspace");
  const { user } = useAuth();
  const { workspaces } = useActiveWorkspace();
  const { data: members = [] } = useBoardMembers(board.id);
  const qc = useQueryClient();

  const [transferOpen, setTransferOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [newOwnerId, setNewOwnerId] = useState("");
  const [targetWorkspaceId, setTargetWorkspaceId] = useState("");
  const [dropConfirmNeeded, setDropConfirmNeeded] = useState(false);

  const canManage =
    !!user &&
    (board.ownerId === user.id ||
      workspaces.some(
        (w) => w.id === board.workspaceId && w.ownerId === user.id,
      ));

  const transfer = useMutation({
    mutationFn: (userId: string) => boardsApi.transfer(board.id, userId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["board", board.id] });
      setTransferOpen(false);
      toast.success(t("ownershipTransferred"));
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : t("ownershipFailed")),
  });

  const move = useMutation({
    mutationFn: (input: {
      workspaceId: string;
      confirmMemberDrop?: boolean;
    }) => boardsApi.move(board.id, input),
    onSuccess: async (updated) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["board", board.id] }),
        qc.invalidateQueries({
          queryKey: boardKeys.byWorkspace(board.workspaceId),
        }),
        qc.invalidateQueries({
          queryKey: boardKeys.byWorkspace(updated.workspaceId),
        }),
      ]);
      setMoveOpen(false);
      setDropConfirmNeeded(false);
      toast.success(t("boardMoved"));
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        const details = err.details as
          | { confirmRequired?: boolean }
          | undefined;
        const raw = err.raw as { confirmRequired?: boolean } | undefined;
        if (
          details?.confirmRequired ||
          raw?.confirmRequired ||
          err.code === "MEMBER_DROP_CONFIRM"
        ) {
          setDropConfirmNeeded(true);
          toast.message(t("moveConfirmDrop"));
          return;
        }
        toast.error(err.message || t("boardMoveFailed"));
        return;
      }
      toast.error(err instanceof Error ? err.message : t("boardMoveFailed"));
    },
  });

  if (!canManage) return null;

  const otherWorkspaces = workspaces.filter((w) => w.id !== board.workspaceId);
  const transferCandidates = members.filter((m) => m.userId !== board.ownerId);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="cursor-pointer">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setTransferOpen(true)}>
            <Crown className="size-3.5" />
            {t("transferOwnership")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setMoveOpen(true)}
            disabled={otherWorkspaces.length === 0}
          >
            <ArrowRightLeft className="size-3.5" />
            {t("moveBoard")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("transferOwnership")}</DialogTitle>
            <DialogDescription>{t("transferOwnershipBody")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>{t("newOwner")}</Label>
            <Select value={newOwnerId} onValueChange={setNewOwnerId}>
              <SelectTrigger>
                <SelectValue placeholder={t("pickMember")} />
              </SelectTrigger>
              <SelectContent>
                {transferCandidates.map((m) => (
                  <SelectItem key={m.userId} value={m.userId}>
                    {m.user?.displayName || m.user?.username || m.userId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferOpen(false)}>
              {t("cancel")}
            </Button>
            <Button
              disabled={!newOwnerId || transfer.isPending}
              onClick={() => transfer.mutate(newOwnerId)}
            >
              {t("transferOwnership")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={moveOpen}
        onOpenChange={(open) => {
          setMoveOpen(open);
          if (!open) setDropConfirmNeeded(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("moveBoard")}</DialogTitle>
            <DialogDescription>
              {dropConfirmNeeded
                ? t("moveConfirmDrop")
                : t("moveBoardBody")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>{t("targetWorkspace")}</Label>
            <Select
              value={targetWorkspaceId}
              onValueChange={setTargetWorkspaceId}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("pickWorkspace")} />
              </SelectTrigger>
              <SelectContent>
                {otherWorkspaces.map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMoveOpen(false)}>
              {t("cancel")}
            </Button>
            <Button
              disabled={!targetWorkspaceId || move.isPending}
              onClick={() =>
                move.mutate({
                  workspaceId: targetWorkspaceId,
                  confirmMemberDrop: dropConfirmNeeded || undefined,
                })
              }
            >
              {dropConfirmNeeded ? t("confirmMove") : t("moveBoard")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
