"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ExternalLink, Github, Link2, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import {
  useBoardGithubItems,
  useBoardGithubRepo,
  useCardGithubLinks,
  useCreateGithubIssueForCard,
  useLinkCardToGithub,
  useUnlinkCardFromGithub,
} from "@/hooks/use-github";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function LinkItemPicker({
  boardId,
  cardId,
  linkedItemIds,
}: {
  boardId: string;
  cardId: string;
  linkedItemIds: Set<string>;
}) {
  const t = useTranslations("github");
  const [open, setOpen] = useState(false);
  const { data: items, isLoading } = useBoardGithubItems(
    boardId,
    { state: "OPEN" },
    open,
  );
  const linkCard = useLinkCardToGithub(cardId);

  const available = (items ?? []).filter((i) => !linkedItemIds.has(i.id));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 cursor-pointer text-xs">
          <Link2 className="me-1.5 size-3.5" />
          {t("linkItem")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="border-b border-border px-3 py-2">
          <p className="text-xs font-medium text-muted-foreground">
            {t("linkItemDescription")}
          </p>
        </div>
        <div className="max-h-64 overflow-y-auto p-1.5">
          {isLoading && (
            <p className="px-2 py-2 text-xs text-muted-foreground">
              {t("loadingItems")}
            </p>
          )}
          {!isLoading && available.length === 0 && (
            <p className="px-2 py-2 text-xs text-muted-foreground">
              {t("noOpenItems")}
            </p>
          )}
          {available.map((item) => (
            <button
              key={item.id}
              type="button"
              className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-1.5 text-start text-sm transition-colors duration-150 hover:bg-muted"
              onClick={() =>
                linkCard.mutate(
                  { githubItemId: item.id },
                  {
                    onSuccess: () => {
                      toast.success(t("linkedCard"));
                      setOpen(false);
                    },
                    onError: () => toast.error(t("linkFailedCard")),
                  },
                )
              }
            >
              <span className="min-w-0 flex-1 truncate">
                <span className="text-muted-foreground">#{item.number}</span>{" "}
                {item.title}
              </span>
              <Badge variant="outline" className="shrink-0 font-normal">
                {item.kind}
              </Badge>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function CreateIssueDialog({
  cardId,
  defaultTitle,
  defaultBody,
}: {
  cardId: string;
  defaultTitle: string;
  defaultBody: string;
}) {
  const t = useTranslations("github");
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(defaultTitle);
  const [body, setBody] = useState(defaultBody);
  const createIssue = useCreateGithubIssueForCard(cardId);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setTitle(defaultTitle);
          setBody(defaultBody);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 cursor-pointer text-xs">
          <Plus className="me-1.5 size-3.5" />
          {t("createIssue")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const trimmed = title.trim();
            if (!trimmed) return;
            createIssue.mutate(
              { title: trimmed, body: body.trim() || undefined },
              {
                onSuccess: () => {
                  toast.success(t("created"));
                  setOpen(false);
                },
                onError: () => toast.error(t("createFailed")),
              },
            );
          }}
        >
          <DialogHeader>
            <DialogTitle>{t("createIssueTitle")}</DialogTitle>
            <DialogDescription>{t("createIssueDescription")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="gh-issue-title">{t("issueTitle")}</Label>
              <Input
                id="gh-issue-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gh-issue-body">{t("issueBody")}</Label>
              <Textarea
                id="gh-issue-body"
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={createIssue.isPending || !title.trim()}
              className="w-full sm:w-auto"
            >
              {createIssue.isPending ? (
                <>
                  <Loader2 className="me-2 size-4 animate-spin" />
                  {t("creating")}
                </>
              ) : (
                t("create")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface CardGithubSectionProps {
  cardId: string;
  boardId: string;
  cardTitle: string;
  cardDescription?: string | null;
}

/** GitHub links for a card — attach existing issues/PRs or create a new issue. */
export function CardGithubSection({
  cardId,
  boardId,
  cardTitle,
  cardDescription,
}: CardGithubSectionProps) {
  const t = useTranslations("github");
  const { data: repoLink } = useBoardGithubRepo(boardId);
  const { data: links = [] } = useCardGithubLinks(cardId);
  const unlinkCard = useUnlinkCardFromGithub(cardId);

  const linkedItemIds = new Set(links.map((l) => l.githubItemId));

  if (!repoLink) {
    return <p className="text-xs text-muted-foreground">{t("noRepoLinked")}</p>;
  }

  return (
    <div className="space-y-3">
      {links.length > 0 && (
        <ul className="space-y-1.5">
          {links.map((link) => (
            <li
              key={link.id}
              className="flex items-center justify-between gap-2 rounded-lg bg-muted/40 px-2.5 py-1.5 text-sm"
            >
              <a
                href={link.githubItem.url}
                target="_blank"
                rel="noreferrer"
                className="flex min-w-0 flex-1 items-center gap-1.5 hover:underline"
              >
                <Github className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="min-w-0 truncate">
                  <span className="text-muted-foreground">
                    #{link.githubItem.number}
                  </span>{" "}
                  {link.githubItem.title}
                </span>
                <ExternalLink className="size-3 shrink-0 text-muted-foreground" />
              </a>
              <div className="flex shrink-0 items-center gap-1.5">
                <Badge
                  variant={link.githubItem.state === "OPEN" ? "default" : "secondary"}
                  className="font-normal"
                >
                  {link.githubItem.state}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 cursor-pointer"
                  onClick={() =>
                    unlinkCard.mutate(link.id, {
                      onSuccess: () => toast.success(t("unlinkedCard")),
                      onError: () => toast.error(t("unlinkFailedCard")),
                    })
                  }
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-2">
        <LinkItemPicker
          boardId={boardId}
          cardId={cardId}
          linkedItemIds={linkedItemIds}
        />
        <CreateIssueDialog
          cardId={cardId}
          defaultTitle={cardTitle}
          defaultBody={cardDescription ?? ""}
        />
      </div>
    </div>
  );
}
