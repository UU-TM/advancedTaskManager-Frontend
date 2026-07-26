"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  useBoardMembers,
  useMemberMutations,
} from "@/hooks/use-kanban-extras";
import type { BoardRole } from "@/types/domain";

type BoardMembersDialogProps = {
  boardId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function BoardMembersDialog({
  boardId,
  open,
  onOpenChange,
}: BoardMembersDialogProps) {
  const t = useTranslations("kanban");
  const tCommon = useTranslations("common");
  const { data: members = [], isLoading } = useBoardMembers(boardId);
  const { add, remove } = useMemberMutations(boardId);
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<BoardRole>("EDITOR");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle className="tracking-tight">{t("membersTitle")}</DialogTitle>
          <DialogDescription>{t("membersDescription")}</DialogDescription>
        </DialogHeader>

        <ul className="max-h-60 space-y-2 overflow-y-auto py-2">
          {isLoading && (
            <li className="text-sm text-muted-foreground">{tCommon("loading")}</li>
          )}
          {members.map((m) => {
            const name = m.user?.username ?? m.userId.slice(0, 8);
            return (
              <li
                key={m.userId}
                className="flex items-center gap-2 rounded border px-2 py-1.5"
              >
                <Avatar className="size-7">
                  <AvatarFallback className="text-[10px]">
                    {name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{name}</p>
                  <p className="text-[10px] text-muted-foreground">{m.role}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-destructive"
                  onClick={() =>
                    remove.mutate(m.userId, {
                      onSuccess: () => toast.success(t("memberRemoved")),
                      onError: () => toast.error(t("failedRemoveMember")),
                    })
                  }
                >
                  {tCommon("remove")}
                </Button>
              </li>
            );
          })}
          {!isLoading && members.length === 0 && (
            <li className="text-sm text-muted-foreground">{t("noMembersYet")}</li>
          )}
        </ul>

        <form
          className="space-y-3 border-t pt-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!userId.trim()) return;
            add.mutate(
              { userId: userId.trim(), role },
              {
                onSuccess: () => {
                  setUserId("");
                  toast.success(t("memberAdded"));
                },
                onError: (err) =>
                  toast.error(
                    err instanceof Error ? err.message : t("failedAddMember"),
                  ),
              },
            );
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="member-user-id">{t("userId")}</Label>
            <Input
              id="member-user-id"
              placeholder={t("userIdPlaceholder")}
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t("role")}</Label>
            <Select
              value={role}
              onValueChange={(v) => setRole(v as BoardRole)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EDITOR">{t("roleEditor")}</SelectItem>
                <SelectItem value="VIEWER">{t("roleViewer")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={add.isPending}>
            {t("addMember")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
