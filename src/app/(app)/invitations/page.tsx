"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  useMyInvitations,
  useRespondToInvitation,
} from "@/hooks/use-workspaces";
import { useActiveWorkspace } from "@/components/layout/active-workspace-context";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function InvitationsPage() {
  const t = useTranslations("workspace");
  const router = useRouter();
  const { setWorkspaceId } = useActiveWorkspace();
  const { data: invitations = [], isLoading } = useMyInvitations();
  const respond = useRespondToInvitation();

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:px-8 md:py-8">
      <PageHeader title={t("inboxTitle")} description={t("inboxSubtitle")} />

      <div className="mt-6 space-y-3">
        {isLoading && <Skeleton className="h-24 w-full" />}
        {!isLoading && invitations.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("inboxEmptyTitle")}</CardTitle>
              <CardDescription>{t("inboxEmptyBody")}</CardDescription>
            </CardHeader>
          </Card>
        )}
        {invitations.map((inv) => (
          <Card key={inv.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {inv.workspaceName ?? t("title")}
              </CardTitle>
              <CardDescription>
                {t("inboxInviteFrom", {
                  name:
                    inv.inviter?.displayName ||
                    inv.inviter?.username ||
                    "someone",
                  role: inv.role === "ADMIN" ? t("roleAdmin") : t("roleMember"),
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button
                disabled={respond.isPending}
                onClick={() =>
                  respond.mutate(
                    { invitationId: inv.id, action: "accept" },
                    {
                      onSuccess: () => {
                        setWorkspaceId(inv.workspaceId);
                        toast.success(t("inviteAccepted"));
                        router.push("/workspace");
                      },
                      onError: () => toast.error(t("inviteRespondFailed")),
                    },
                  )
                }
              >
                {t("accept")}
              </Button>
              <Button
                variant="outline"
                disabled={respond.isPending}
                onClick={() =>
                  respond.mutate(
                    { invitationId: inv.id, action: "decline" },
                    {
                      onSuccess: () => toast.success(t("inviteDeclined")),
                      onError: () => toast.error(t("inviteRespondFailed")),
                    },
                  )
                }
              >
                {t("decline")}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
