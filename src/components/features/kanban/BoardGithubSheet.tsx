"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  ExternalLink,
  Github,
  GitPullRequest,
  Loader2,
  RefreshCw,
  Unlink,
} from "lucide-react";
import { toast } from "sonner";
import {
  useBoardGithubItems,
  useBoardGithubRepo,
  useGithubRepos,
  useGithubStatus,
  useLinkBoardRepo,
  useSyncBoardRepo,
  useUnlinkBoardRepo,
} from "@/hooks/use-github";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

function LinkRepoForm({ boardId }: { boardId: string }) {
  const t = useTranslations("github");
  const { data: repos, isLoading } = useGithubRepos(true);
  const linkRepo = useLinkBoardRepo(boardId);
  const [selected, setSelected] = useState<string>("");
  const [syncIssues, setSyncIssues] = useState(true);
  const [syncPulls, setSyncPulls] = useState(true);
  const [autoCreateCards, setAutoCreateCards] = useState(false);

  const chosen = repos?.find((r) => r.fullName === selected);

  function handleLink() {
    if (!chosen) return;
    linkRepo.mutate(
      {
        owner: chosen.owner,
        repo: chosen.name,
        syncIssues,
        syncPulls,
        autoCreateCards,
      },
      {
        onSuccess: () => toast.success(t("linked")),
        onError: () => toast.error(t("linkFailed")),
      },
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <p className="text-sm font-medium">{t("selectRepo")}</p>
        {isLoading ? (
          <Skeleton className="h-9 w-full" />
        ) : (
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("selectRepo")} />
            </SelectTrigger>
            <SelectContent>
              {(repos ?? []).map((repo) => (
                <SelectItem key={repo.id} value={repo.fullName}>
                  {repo.fullName}
                  {repo.private && ` (${t("private")})`}
                </SelectItem>
              ))}
              {(repos ?? []).length === 0 && (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  {t("noRepos")}
                </div>
              )}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="space-y-2.5">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={syncIssues}
            onCheckedChange={(c) => setSyncIssues(!!c)}
          />
          {t("syncIssues")}
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={syncPulls}
            onCheckedChange={(c) => setSyncPulls(!!c)}
          />
          {t("syncPulls")}
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={autoCreateCards}
            onCheckedChange={(c) => setAutoCreateCards(!!c)}
          />
          {t("autoCreateCards")}
        </label>
      </div>

      <Button
        className="w-full cursor-pointer"
        disabled={!chosen || linkRepo.isPending}
        onClick={handleLink}
      >
        {linkRepo.isPending ? (
          <>
            <Loader2 className="me-2 size-4 animate-spin" />
            {t("linking")}
          </>
        ) : (
          t("linkRepo")
        )}
      </Button>
    </div>
  );
}

function ItemsList({
  boardId,
  kind,
}: {
  boardId: string;
  kind: "ISSUE" | "PR";
}) {
  const t = useTranslations("github");
  const { data: items, isLoading } = useBoardGithubItems(boardId, { kind });

  if (isLoading) {
    return (
      <div className="space-y-2 py-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <p className="py-4 text-sm text-muted-foreground">{t("noItems")}</p>
    );
  }

  return (
    <ul className="max-h-72 space-y-1.5 overflow-y-auto py-2">
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors duration-150 hover:bg-muted/60"
          >
            <span className="min-w-0 flex-1 truncate">
              <span className="text-muted-foreground">#{item.number}</span>{" "}
              {item.title}
              {item.draft && (
                <Badge variant="outline" className="ms-2 font-normal">
                  {t("draft")}
                </Badge>
              )}
            </span>
            <span className="flex shrink-0 items-center gap-1.5">
              <Badge
                variant={item.state === "OPEN" ? "default" : "secondary"}
                className="font-normal"
              >
                {item.state}
              </Badge>
              <ExternalLink className="size-3.5 text-muted-foreground" />
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

function LinkedRepoPanel({ boardId }: { boardId: string }) {
  const t = useTranslations("github");
  const { data: repoLink } = useBoardGithubRepo(boardId);
  const syncRepo = useSyncBoardRepo(boardId);
  const unlinkRepo = useUnlinkBoardRepo(boardId);

  if (!repoLink) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 px-3.5 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">
            {repoLink.owner}/{repoLink.repo}
          </p>
          <p className="text-xs text-muted-foreground">
            {[
              repoLink.syncIssues && t("issues"),
              repoLink.syncPulls && t("pullRequests"),
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <a
          href={`https://github.com/${repoLink.owner}/${repoLink.repo}`}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
          aria-label={t("openInGithub")}
        >
          <ExternalLink className="size-4" />
        </a>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 cursor-pointer"
          disabled={syncRepo.isPending}
          onClick={() =>
            syncRepo.mutate(undefined, {
              onSuccess: (result) =>
                toast.success(
                  t("synced", {
                    issues: result.issuesSynced,
                    prs: result.pullsSynced,
                  }),
                ),
              onError: () => toast.error(t("syncFailed")),
            })
          }
        >
          {syncRepo.isPending ? (
            <Loader2 className="me-2 size-4 animate-spin" />
          ) : (
            <RefreshCw className="me-2 size-4" />
          )}
          {syncRepo.isPending ? t("syncing") : t("sync")}
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer text-destructive hover:text-destructive"
            >
              <Unlink className="me-2 size-4" />
              {t("unlink")}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("unlinkTitle")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("unlinkDescription")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="cursor-pointer">
                {t("cancelAction")}
              </AlertDialogCancel>
              <AlertDialogAction
                className="cursor-pointer bg-destructive text-white hover:bg-destructive/90"
                onClick={() =>
                  unlinkRepo.mutate(undefined, {
                    onSuccess: () => toast.success(t("unlinked")),
                    onError: () => toast.error(t("unlinkFailed")),
                  })
                }
              >
                {t("unlink")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Tabs defaultValue="issues">
        <TabsList className="w-full">
          <TabsTrigger value="issues" className="cursor-pointer">
            {t("issues")}
          </TabsTrigger>
          <TabsTrigger value="prs" className="cursor-pointer">
            {t("pullRequests")}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="issues">
          <ItemsList boardId={boardId} kind="ISSUE" />
        </TabsContent>
        <TabsContent value="prs">
          <ItemsList boardId={boardId} kind="PR" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function BoardGithubSheet({ boardId }: { boardId: string }) {
  const t = useTranslations("github");
  const [open, setOpen] = useState(false);
  const { data: status, isLoading: statusLoading } = useGithubStatus();
  const { data: repoLink, isLoading: repoLoading } = useBoardGithubRepo(
    open ? boardId : undefined,
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        variant="outline"
        size="sm"
        className={cn("cursor-pointer")}
        onClick={() => setOpen(true)}
      >
        <Github className="me-2 size-4" />
        {t("title")}
        {repoLink && (
          <Badge variant="secondary" className="ms-2 font-normal">
            <GitPullRequest className="size-3" />
          </Badge>
        )}
      </Button>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{t("boardTitle")}</SheetTitle>
          <SheetDescription>{t("boardDescription")}</SheetDescription>
        </SheetHeader>

        <div className="px-4 pb-6">
          {statusLoading || (open && repoLoading) ? (
            <div className="space-y-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : !status?.connected ? (
            <Alert>
              <AlertTitle>{t("notConnectedTitle")}</AlertTitle>
              <AlertDescription className="space-y-3">
                <p>{t("notConnectedDescription")}</p>
                <Button asChild size="sm" className="cursor-pointer">
                  <Link href="/integrations">{t("goToIntegrations")}</Link>
                </Button>
              </AlertDescription>
            </Alert>
          ) : repoLink ? (
            <LinkedRepoPanel boardId={boardId} />
          ) : (
            <LinkRepoForm boardId={boardId} />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
