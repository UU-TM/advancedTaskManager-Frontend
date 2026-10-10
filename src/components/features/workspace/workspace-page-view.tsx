"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { MailPlus, Trash2, UserMinus } from "lucide-react";
import { useActiveWorkspace } from "@/components/layout/active-workspace-context";
import { useAuth } from "@/hooks/use-auth";
import {
  useCancelWorkspaceInvitation,
  useDeleteWorkspace,
  useInviteToWorkspace,
  useRemoveWorkspaceMember,
  useUpdateWorkspace,
  useWorkspaceInvitations,
  useWorkspaceMembers,
} from "@/hooks/use-workspaces";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import type { WorkspaceRole } from "@/types/domain";

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
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function WorkspacePageView() {
  const t = useTranslations("workspace");
  const { user } = useAuth();
  const {
    workspaceId,
    workspace,
    workspaces,
    setWorkspaceId,
    isLoading,
  } = useActiveWorkspace();

  const { data: members = [], isLoading: membersLoading } =
    useWorkspaceMembers(workspaceId);
  const { data: invitations = [] } = useWorkspaceInvitations(workspaceId);
  const updateWorkspace = useUpdateWorkspace(workspaceId);
  const deleteWorkspace = useDeleteWorkspace();
  const removeMember = useRemoveWorkspaceMember(workspaceId);
  const invite = useInviteToWorkspace(workspaceId);
  const cancelInvite = useCancelWorkspaceInvitation(workspaceId);

  const [name, setName] = useState("");
  const [inviteUsername, setInviteUsername] = useState("");
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>("MEMBER");
  const [confirmInviteOpen, setConfirmInviteOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  useEffect(() => {
    if (workspace) setName(workspace.name);
  }, [workspace?.id, workspace?.name]);

  const isOwner = !!user && workspace?.ownerId === user.id;
  const isAdmin = useMemo(() => {
    if (!user || !workspaceId) return false;
    if (workspace?.ownerId === user.id) return true;
    return members.some((m) => m.userId === user.id && m.role === "ADMIN");
  }, [user, workspace, workspaceId, members]);

  async function handleRename() {
    const trimmed = name.trim();
    if (!trimmed || !workspaceId) return;
    try {
      await updateWorkspace.mutateAsync(trimmed);
      toast.success(t("renamed"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("renameFailed"));
    }
  }

  async function handleInvite() {
    if (!inviteUsername.trim()) return;
    try {
      await invite.mutateAsync({
        username: inviteUsername.trim(),
        role: inviteRole,
      });
      setConfirmInviteOpen(false);
      setInviteUsername("");
      toast.success(t("inviteSent"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("inviteFailed"));
    }
  }

  async function handleDelete() {
    if (!workspaceId || !workspace) return;
    if (deleteConfirm.trim() !== workspace.name) return;
    try {
      await deleteWorkspace.mutateAsync(workspaceId);
      const remaining = workspaces.filter((w) => w.id !== workspaceId);
      if (remaining[0]) setWorkspaceId(remaining[0].id);
      setDeleteOpen(false);
      setDeleteConfirm("");
      toast.success(t("deleted"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("deleteFailed"));
    }
  }

  if (isLoading && !workspace) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-8 md:px-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-8 md:py-8">
      <PageHeader
        title={workspace?.name ?? t("title")}
        description={t("subtitle")}
      />

      <div className="mt-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("generalTitle")}</CardTitle>
            <CardDescription>{t("generalDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="ws-rename">{t("name")}</Label>
              <Input
                id="ws-rename"
                value={name}
                disabled={!isAdmin}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            {isAdmin && (
              <Button
                onClick={() => void handleRename()}
                disabled={
                  updateWorkspace.isPending ||
                  !name.trim() ||
                  name.trim() === workspace?.name
                }
              >
                {t("saveName")}
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("membersTitle")}</CardTitle>
            <CardDescription>{t("membersDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {membersLoading && (
                <li className="text-sm text-muted-foreground">{t("loading")}</li>
              )}
              {members.map((m) => {
                const nameLabel = displayName(m.user);
                const canRemove = isAdmin && m.userId !== workspace?.ownerId;
                return (
                  <li
                    key={m.userId}
                    className="flex items-center gap-2 rounded-lg border px-2.5 py-2"
                  >
                    <Avatar className="size-8">
                      {m.user?.avatarUrl ? (
                        <AvatarImage src={m.user.avatarUrl} alt="" />
                      ) : null}
                      <AvatarFallback className="text-[10px]">
                        {initials(nameLabel)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{nameLabel}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {m.role === "ADMIN" ? t("roleAdmin") : t("roleMember")}
                        {m.userId === workspace?.ownerId
                          ? ` · ${t("ownerBadge")}`
                          : ""}
                      </p>
                    </div>
                    {canRemove && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() =>
                          removeMember.mutate(m.userId, {
                            onSuccess: () => toast.success(t("memberRemoved")),
                            onError: () => toast.error(t("memberRemoveFailed")),
                          })
                        }
                      >
                        <UserMinus className="size-4" />
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>

            {isAdmin && (
              <div className="space-y-3 border-t pt-4">
                <p className="text-sm font-medium">{t("inviteTitle")}</p>
                <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
                  <div className="space-y-1.5">
                    <Label htmlFor="invite-user">{t("inviteUsername")}</Label>
                    <Input
                      id="invite-user"
                      value={inviteUsername}
                      onChange={(e) => setInviteUsername(e.target.value)}
                      placeholder={t("inviteUsernamePlaceholder")}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t("role")}</Label>
                    <Select
                      value={inviteRole}
                      onValueChange={(v) => setInviteRole(v as WorkspaceRole)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MEMBER">{t("roleMember")}</SelectItem>
                        <SelectItem value="ADMIN">{t("roleAdmin")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  className="gap-1.5"
                  disabled={!inviteUsername.trim()}
                  onClick={() => setConfirmInviteOpen(true)}
                >
                  <MailPlus className="size-4" />
                  {t("inviteAction")}
                </Button>

                {invitations.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {t("pendingInvites")}
                    </p>
                    {invitations.map((inv) => (
                      <div
                        key={inv.id}
                        className="flex items-center justify-between gap-2 rounded-md border px-2.5 py-2 text-sm"
                      >
                        <span>
                          @{inv.inviteeUsername} ·{" "}
                          {inv.role === "ADMIN"
                            ? t("roleAdmin")
                            : t("roleMember")}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            cancelInvite.mutate(inv.id, {
                              onSuccess: () =>
                                toast.success(t("inviteCancelled")),
                              onError: () =>
                                toast.error(t("inviteCancelFailed")),
                            })
                          }
                        >
                          {t("cancelInvite")}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {isOwner && (
          <Card className="border-destructive/40">
            <CardHeader>
              <CardTitle className="text-destructive">
                {t("dangerTitle")}
              </CardTitle>
              <CardDescription>{t("dangerDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                className="gap-1.5"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="size-4" />
                {t("deleteWorkspace")}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={confirmInviteOpen} onOpenChange={setConfirmInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("confirmInviteTitle")}</DialogTitle>
            <DialogDescription>
              {t("confirmInviteBody", {
                username: inviteUsername.trim(),
                role:
                  inviteRole === "ADMIN" ? t("roleAdmin") : t("roleMember"),
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmInviteOpen(false)}
            >
              {t("cancel")}
            </Button>
            <Button
              onClick={() => void handleInvite()}
              disabled={invite.isPending}
            >
              {t("confirmInviteAction")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteConfirmTitle")}</DialogTitle>
            <DialogDescription>
              {t("deleteConfirmBody", { name: workspace?.name ?? "" })}
            </DialogDescription>
          </DialogHeader>
          <Input
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder={workspace?.name}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              disabled={
                deleteWorkspace.isPending ||
                deleteConfirm.trim() !== workspace?.name
              }
              onClick={() => void handleDelete()}
            >
              {t("deleteWorkspace")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
