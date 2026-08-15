"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Search, UserPlus } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  useBoardMembers,
  useMemberMutations,
} from "@/hooks/use-kanban-extras";
import { useWorkspaceMembers } from "@/hooks/use-workspaces";
import { cn } from "@/lib/utils";
import type { BoardRole } from "@/types/domain";

type BoardMembersDialogProps = {
  boardId: string;
  workspaceId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function displayName(user?: {
  username?: string;
  displayName?: string | null;
}): string {
  if (!user) return "—";
  return user.displayName?.trim() || user.username || "—";
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function BoardMembersDialog({
  boardId,
  workspaceId,
  open,
  onOpenChange,
}: BoardMembersDialogProps) {
  const t = useTranslations("kanban");
  const tCommon = useTranslations("common");
  const { data: members = [], isLoading } = useBoardMembers(boardId);
  const { data: workspaceMembers = [], isLoading: loadingWorkspace } =
    useWorkspaceMembers(open ? workspaceId : undefined);
  const { add, remove } = useMemberMutations(boardId);

  const [query, setQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [role, setRole] = useState<BoardRole>("EDITOR");

  const boardUserIds = useMemo(
    () => new Set(members.map((m) => m.userId)),
    [members],
  );

  const candidates = useMemo(() => {
    const q = query.trim().toLowerCase();
    return workspaceMembers
      .filter((m) => !boardUserIds.has(m.userId))
      .filter((m) => {
        if (!q) return true;
        const name = displayName(m.user).toLowerCase();
        const username = m.user?.username?.toLowerCase() ?? "";
        return name.includes(q) || username.includes(q);
      });
  }, [workspaceMembers, boardUserIds, query]);

  const selectedStillAvailable = selectedUserId
    ? candidates.some((c) => c.userId === selectedUserId)
    : false;
  const effectiveSelectedId = selectedStillAvailable ? selectedUserId : null;

  function handleAdd() {
    if (!effectiveSelectedId) return;
    add.mutate(
      { userId: effectiveSelectedId, role },
      {
        onSuccess: () => {
          setSelectedUserId(null);
          setQuery("");
          toast.success(t("memberAdded"));
        },
        onError: (err) =>
          toast.error(
            err instanceof Error ? err.message : t("failedAddMember"),
          ),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle className="tracking-tight">{t("membersTitle")}</DialogTitle>
          <DialogDescription>{t("membersDescription")}</DialogDescription>
        </DialogHeader>

        <ul className="max-h-48 space-y-2 overflow-y-auto py-1">
          {isLoading && (
            <li className="text-sm text-muted-foreground">{tCommon("loading")}</li>
          )}
          {members.map((m) => {
            const name = displayName(m.user) || m.userId.slice(0, 8);
            return (
              <li
                key={m.userId}
                className="flex items-center gap-2 rounded-lg border border-border/80 px-2.5 py-2"
              >
                <Avatar className="size-8">
                  {m.user?.avatarUrl ? (
                    <AvatarImage src={m.user.avatarUrl} alt="" />
                  ) : null}
                  <AvatarFallback className="text-[10px]">
                    {initials(name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {m.role === "EDITOR" ? t("roleEditor") : t("roleViewer")}
                  </p>
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

        <div className="space-y-3 border-t pt-3">
          <div className="space-y-1.5">
            <Label htmlFor="member-search">{t("pickMember")}</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="member-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("pickMemberPlaceholder")}
                className="ps-8"
                disabled={!workspaceId}
              />
            </div>
          </div>

          <ul className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-border/80 p-1">
            {!workspaceId && (
              <li className="px-2 py-3 text-sm text-muted-foreground">
                {t("workspaceUnavailable")}
              </li>
            )}
            {workspaceId && loadingWorkspace && (
              <li className="px-2 py-3 text-sm text-muted-foreground">
                {tCommon("loading")}
              </li>
            )}
            {workspaceId &&
              !loadingWorkspace &&
              candidates.map((m) => {
                const name = displayName(m.user);
                const selected = effectiveSelectedId === m.userId;
                return (
                  <li key={m.userId}>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedUserId(selected ? null : m.userId)
                      }
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-start transition-colors",
                        selected
                          ? "bg-primary/12 text-foreground"
                          : "hover:bg-muted/70",
                      )}
                    >
                      <Avatar className="size-7">
                        {m.user?.avatarUrl ? (
                          <AvatarImage src={m.user.avatarUrl} alt="" />
                        ) : null}
                        <AvatarFallback className="text-[10px]">
                          {initials(name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{name}</p>
                        {m.user?.username && m.user.username !== name && (
                          <p className="truncate text-[11px] text-muted-foreground">
                            @{m.user.username}
                          </p>
                        )}
                      </div>
                      {selected && (
                        <Check className="size-4 shrink-0 text-primary" />
                      )}
                    </button>
                  </li>
                );
              })}
            {workspaceId && !loadingWorkspace && candidates.length === 0 && (
              <li className="px-2 py-3 text-sm text-muted-foreground">
                {query.trim()
                  ? t("noMatchingMembers")
                  : t("allWorkspaceMembersAdded")}
              </li>
            )}
          </ul>

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

          <Button
            type="button"
            className="w-full gap-1.5"
            disabled={!effectiveSelectedId || add.isPending}
            onClick={handleAdd}
          >
            <UserPlus className="size-4" />
            {t("addMember")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
