"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Calendar,
  Check,
  CheckSquare,
  Eye,
  EyeOff,
  GitBranch,
  Link2,
  MessageSquare,
  Paperclip,
  Pencil,
  Sparkles,
  Timer,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShamsiDatePicker } from "@/components/ui/shamsi-date-picker";
import {
  useAssignCard,
  useCard,
  useUnassignCard,
  useUpdateCard,
} from "@/hooks/use-card";
import {
  useAttachmentMutations,
  useAttachments,
  useBoardLabels,
  useBoardMembers,
  useCardActivity,
  useChecklistMutations,
  useChecklists,
  useCommentMutations,
  useComments,
  useCreateLabel,
  useToggleCardLabel,
} from "@/hooks/use-kanban-extras";
import {
  useActiveTimeEntry,
  useStartTimeEntry,
  useStopTimeEntry,
} from "@/hooks/use-time-entries";
import {
  useCardDependencies,
  useCreateDependency,
  useRemoveDependency,
} from "@/hooks/use-dependencies";
import { useColumns } from "@/hooks/use-columns";
import { useCardWatchers, useToggleWatch } from "@/hooks/use-watchers";
import { useCommentReactions } from "@/hooks/use-reactions";
import { useSummarizeCard } from "@/hooks/use-ai";
import { cardsApi, attachmentsApi } from "@/lib/api";
import { formatAppDate } from "@/lib/date";
import type { Locale } from "@/i18n/config";
import { PRIORITY_COLORS, LABEL_PRESET_COLORS } from "./priority";
import type { CardPriority, CardRecurrence } from "@/types/domain";
import { cn } from "@/lib/utils";
import { CardGithubSection } from "./CardGithubSection";
import { useAuth } from "@/hooks/use-auth";

type CardDetailModalProps = {
  cardId: string | null;
  boardId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function Section({
  title,
  icon,
  children,
  delay = 0,
}: {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.section
      className="space-y-3"
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay, ease: "easeOut" }}
    >
      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        {title}
      </h3>
      {children}
    </motion.section>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
      <motion.div
        className={cn(
          "h-full rounded-full",
          value >= 100 ? "bg-success" : "bg-primary",
        )}
        initial={false}
        animate={{ width: `${value}%` }}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
      />
    </div>
  );
}

/** Brief brand pulse when a rewarding action succeeds. */
function SuccessPulse({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.span
          className="pointer-events-none absolute inset-0 rounded-md bg-primary/25"
          initial={{ opacity: 0.7, scale: 0.96 }}
          animate={{ opacity: 0, scale: 1.06 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        />
      )}
    </AnimatePresence>
  );
}

export function CardDetailModal({
  cardId,
  boardId,
  open,
  onOpenChange,
}: CardDetailModalProps) {
  const t = useTranslations("card");
  const tCommon = useTranslations("common");
  const locale = useLocale() as Locale;
  const reduce = useReducedMotion();
  const { user } = useAuth();
  const { data: card, isLoading } = useCard(cardId ?? undefined);
  const updateCard = useUpdateCard();
  const assignCard = useAssignCard();
  const unassignCard = useUnassignCard();

  const { data: labels = [] } = useBoardLabels(boardId);
  const { data: members = [] } = useBoardMembers(boardId);
  const { data: checklists = [] } = useChecklists(cardId ?? undefined);
  const { data: comments = [] } = useComments(cardId ?? undefined);
  const { data: attachments = [] } = useAttachments(cardId ?? undefined);
  const { data: activity = [] } = useCardActivity(cardId ?? undefined);
  const { data: deps = [] } = useCardDependencies(cardId ?? undefined);
  const { data: columns = [] } = useColumns(boardId);
  const createDep = useCreateDependency();
  const removeDep = useRemoveDependency();
  const { data: activeTimer } = useActiveTimeEntry();
  const startTimer = useStartTimeEntry();
  const stopTimer = useStopTimeEntry();

  const createLabel = useCreateLabel(boardId);
  const toggleLabel = useToggleCardLabel(cardId ?? "", card?.columnId);
  const checklistMut = useChecklistMutations(cardId ?? "");
  const commentMut = useCommentMutations(cardId ?? "");
  const attachmentMut = useAttachmentMutations(cardId ?? "", card?.columnId);
  const { data: watchers } = useCardWatchers(cardId ?? undefined);
  const toggleWatch = useToggleWatch(cardId ?? "");
  const reactions = useCommentReactions(cardId ?? "");
  const summarizeCard = useSummarizeCard();
  const tAi = useTranslations("ai");
  const tWatch = useTranslations("watch");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentBody, setEditingCommentBody] = useState("");
  const [newChecklistTitle, setNewChecklistTitle] = useState("");
  const [newLabelName, setNewLabelName] = useState("");
  const [blockerPick, setBlockerPick] = useState("");
  const [itemDrafts, setItemDrafts] = useState<Record<string, string>>({});
  const [hydratedId, setHydratedId] = useState<string | null>(null);
  const [pulseKey, setPulseKey] = useState<string | null>(null);
  const [celebrateListId, setCelebrateListId] = useState<string | null>(null);

  const boardCards = useMemo(
    () =>
      columns.flatMap((c) =>
        (c.cards ?? []).map((cardRow) => ({
          id: cardRow.id,
          title: cardRow.title,
        })),
      ),
    [columns],
  );

  function reward(key: string) {
    setPulseKey(key);
    window.setTimeout(() => setPulseKey((k) => (k === key ? null : k)), 480);
  }

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description ?? "");
      setHydratedId(card.id);
    }
  }, [card?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!cardId || !open || hydratedId !== cardId || !card) return;
    const timer = setTimeout(() => {
      const titleChanged = title.trim() && title.trim() !== card.title;
      const descChanged = description !== (card.description ?? "");
      if (!titleChanged && !descChanged) return;
      updateCard.mutate(
        {
          id: card.id,
          input: {
            ...(titleChanged ? { title: title.trim() } : {}),
            ...(descChanged ? { description } : {}),
          },
        },
        { onError: () => toast.error(t("failedSave")) },
      );
    }, 600);
    return () => clearTimeout(timer);
  }, [title, description, cardId, open, hydratedId]); // eslint-disable-line react-hooks/exhaustive-deps

  const assigneeIds = new Set(card?.assignees?.map((a) => a.id) ?? []);
  const cardLabelIds = new Set(card?.labels?.map((l) => l.id) ?? []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col gap-0 overflow-hidden rounded-2xl border-border bg-card p-0 shadow-xl sm:max-w-3xl">
        <DialogHeader className="relative shrink-0 space-y-0 border-b border-border/80 text-start">
          <DialogTitle className="sr-only">{t("details")}</DialogTitle>
          {card?.coverColor ? (
            <motion.div
              layout
              className="rounded-t-2xl px-6 pb-5 pt-12 pe-14"
              style={{ backgroundColor: card.coverColor }}
              transition={{ duration: 0.25 }}
            >
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-auto rounded-none border-none bg-transparent px-0 py-1.5 text-xl font-semibold text-white shadow-none outline-none placeholder:text-white/70 focus-visible:border-none focus-visible:ring-0 dark:bg-transparent"
                placeholder={t("titlePlaceholder")}
              />
            </motion.div>
          ) : (
            <div className="py-4 ps-6 pe-14">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-auto rounded-none border-none bg-transparent px-0 py-1.5 text-xl font-semibold shadow-none outline-none focus-visible:border-none focus-visible:ring-0 dark:bg-transparent"
                placeholder={t("titlePlaceholder")}
              />
            </div>
          )}
        </DialogHeader>

        <div className="grid flex-1 gap-8 overflow-y-auto px-6 py-5 md:grid-cols-[1fr_200px]">
          <div className="min-w-0">
            {isLoading && (
              <p className="text-sm text-muted-foreground">{tCommon("loading")}</p>
            )}

            <Tabs defaultValue="details" className="gap-6">
              <TabsList>
                <TabsTrigger value="details">{t("details")}</TabsTrigger>
                <TabsTrigger value="activity">{t("activity")}</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-0 space-y-8">
            <Section
              title={t("labels")}
              delay={0.02}
            >
              <div className="flex flex-wrap gap-2">
                {labels.map((label) => {
                  const on = cardLabelIds.has(label.id);
                  return (
                    <motion.button
                      key={label.id}
                      type="button"
                      whileTap={reduce ? undefined : { scale: 0.94 }}
                      onClick={() =>
                        toggleLabel.mutate(
                          { labelId: label.id, attached: on },
                          {
                            onSuccess: () => {
                              if (!on) reward(`label-${label.id}`);
                            },
                          },
                        )
                      }
                      className={cn(
                        "relative cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium text-white transition-shadow duration-150",
                        on
                          ? "ring-2 ring-primary ring-offset-2 ring-offset-card shadow-sm"
                          : "opacity-55 hover:opacity-90",
                      )}
                      style={{ backgroundColor: label.color }}
                    >
                      <SuccessPulse show={pulseKey === `label-${label.id}`} />
                      {on && <Check className="me-1 inline size-3" />}
                      {label.name}
                    </motion.button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder={t("newLabel")}
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  className="h-9"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  className="relative"
                  disabled={!newLabelName.trim()}
                  onClick={() => {
                    const color =
                      LABEL_PRESET_COLORS[
                        Math.floor(Math.random() * LABEL_PRESET_COLORS.length)
                      ];
                    createLabel.mutate(
                      { name: newLabelName.trim(), color },
                      {
                        onSuccess: () => {
                          setNewLabelName("");
                          reward("new-label");
                        },
                        onError: () => toast.error(t("failedCreateLabel")),
                      },
                    );
                  }}
                >
                  <SuccessPulse show={pulseKey === "new-label"} />
                  {tCommon("add")}
                </Button>
              </div>
            </Section>

            <Section title={t("description")} delay={0.05}>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("descriptionPlaceholder")}
                rows={4}
                className="resize-none bg-muted/40 transition-colors focus:bg-background"
              />
            </Section>

            <Section
              title={t("checklists")}
              icon={<CheckSquare className="size-3.5" />}
              delay={0.08}
            >
              <div className="space-y-4">
                {checklists.map((list) => {
                  const done = list.items.filter((i) => i.completed).length;
                  const total = list.items.length;
                  const pct = total ? Math.round((done / total) * 100) : 0;
                  const celebrating = celebrateListId === list.id;
                  return (
                    <div
                      key={list.id}
                      className="relative space-y-3 rounded-xl bg-muted/40 p-4"
                    >
                      <AnimatePresence>
                        {celebrating && (
                          <motion.div
                            className="pointer-events-none absolute inset-0 rounded-xl border-2 border-success/50"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: [0, 1, 0], scale: [0.98, 1.01, 1.02] }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                          />
                        )}
                      </AnimatePresence>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium">{list.title}</p>
                        <div className="flex items-center gap-2">
                          <span className="tabular-nums text-xs text-muted-foreground">
                            {done}/{total}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            onClick={() => checklistMut.remove.mutate(list.id)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                      <ProgressBar value={pct} />
                      <ul className="space-y-1">
                        <AnimatePresence initial={false}>
                          {list.items.map((item) => (
                            <motion.li
                              key={item.id}
                              layout
                              initial={reduce ? false : { opacity: 0, x: -6 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.18 }}
                              className="group/item flex items-center gap-2 rounded-lg px-1 py-1.5 transition-colors hover:bg-background/60"
                            >
                              <Checkbox
                                checked={item.completed}
                                onCheckedChange={(checked) => {
                                  const next = !!checked;
                                  checklistMut.updateItem.mutate(
                                    { id: item.id, completed: next },
                                    {
                                      onSuccess: () => {
                                        if (!next) return;
                                        const nextDone = done + (item.completed ? 0 : 1);
                                        const nextTotal = total;
                                        if (
                                          nextTotal > 0 &&
                                          nextDone >= nextTotal
                                        ) {
                                          setCelebrateListId(list.id);
                                          reward(`list-${list.id}`);
                                          window.setTimeout(
                                            () =>
                                              setCelebrateListId((id) =>
                                                id === list.id ? null : id,
                                              ),
                                            800,
                                          );
                                          toast.success(t("checklistComplete"), {
                                            duration: 2000,
                                          });
                                        } else {
                                          reward(`item-${item.id}`);
                                        }
                                      },
                                    },
                                  );
                                }}
                              />
                              <motion.span
                                className={cn(
                                  "relative flex-1 text-sm",
                                  item.completed &&
                                    "text-muted-foreground line-through",
                                )}
                                animate={
                                  pulseKey === `item-${item.id}` && !reduce
                                    ? { scale: [1, 1.02, 1] }
                                    : {}
                                }
                                transition={{ duration: 0.28 }}
                              >
                                {item.title}
                              </motion.span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-6 opacity-0 transition-opacity group-hover/item:opacity-100 focus-visible:opacity-100"
                                onClick={() =>
                                  checklistMut.removeItem.mutate(item.id)
                                }
                              >
                                <X className="size-3" />
                              </Button>
                            </motion.li>
                          ))}
                        </AnimatePresence>
                      </ul>
                      <form
                        className="flex gap-2"
                        onSubmit={(e) => {
                          e.preventDefault();
                          const itemTitle = (itemDrafts[list.id] ?? "").trim();
                          if (!itemTitle) return;
                          checklistMut.addItem.mutate(
                            { checklistId: list.id, title: itemTitle },
                            {
                              onSuccess: () => {
                                setItemDrafts((d) => ({ ...d, [list.id]: "" }));
                                reward(`add-item-${list.id}`);
                              },
                            },
                          );
                        }}
                      >
                        <Input
                          className="h-9 bg-background/70"
                          placeholder={t("addItem")}
                          value={itemDrafts[list.id] ?? ""}
                          onChange={(e) =>
                            setItemDrafts((d) => ({
                              ...d,
                              [list.id]: e.target.value,
                            }))
                          }
                        />
                        <Button
                          type="submit"
                          size="sm"
                          variant="secondary"
                          className="relative"
                        >
                          <SuccessPulse
                            show={pulseKey === `add-item-${list.id}`}
                          />
                          {tCommon("add")}
                        </Button>
                      </form>
                    </div>
                  );
                })}
              </div>
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newChecklistTitle.trim()) return;
                  checklistMut.create.mutate(newChecklistTitle.trim(), {
                    onSuccess: () => {
                      setNewChecklistTitle("");
                      reward("new-checklist");
                      toast.success(t("checklistAdded"));
                    },
                  });
                }}
              >
                <Input
                  className="h-9"
                  placeholder={t("checklistTitle")}
                  value={newChecklistTitle}
                  onChange={(e) => setNewChecklistTitle(e.target.value)}
                />
                <Button type="submit" size="sm" className="relative">
                  <SuccessPulse show={pulseKey === "new-checklist"} />
                  {t("addChecklist")}
                </Button>
              </form>
            </Section>

            <Section
              title={t("attachments")}
              icon={<Paperclip className="size-3.5" />}
              delay={0.1}
            >
              <ul className="space-y-2">
                {attachments.map((att) => (
                  <li
                    key={att.id}
                    className="flex items-center gap-2 rounded-xl bg-muted/40 px-3 py-2 text-sm transition-colors hover:bg-muted/70"
                  >
                    <span className="flex-1 truncate">{att.filename}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={async () => {
                        if (!cardId) return;
                        try {
                          await cardsApi.setCover(cardId, att.id);
                          toast.success(t("coverSet"));
                          updateCard.mutate({
                            id: cardId,
                            input: { coverAttachmentId: att.id },
                          });
                        } catch {
                          toast.error(t("failedSetCover"));
                        }
                      }}
                    >
                      {tCommon("cover")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => {
                        const a = document.createElement("a");
                        a.href = attachmentsApi.downloadUrl(att.id);
                        a.target = "_blank";
                        a.rel = "noreferrer";
                        a.click();
                      }}
                    >
                      <Upload className="size-3.5 rotate-180" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => attachmentMut.remove.mutate(att.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </li>
                ))}
              </ul>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/20 px-3 py-3 text-sm text-muted-foreground transition-colors duration-150 hover:border-primary/40 hover:bg-primary/5 hover:text-foreground">
                <Upload className="size-4" />
                {t("uploadFile")}
                <input
                  type="file"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    attachmentMut.upload.mutate(file, {
                      onSuccess: () => {
                        toast.success(t("uploaded"));
                        reward("upload");
                      },
                      onError: () => toast.error(t("uploadFailed")),
                    });
                    e.target.value = "";
                  }}
                />
              </label>
            </Section>
              </TabsContent>

              <TabsContent value="activity" className="mt-0 space-y-8">
            <Section
              title={t("comments")}
              icon={<MessageSquare className="size-3.5" />}
              delay={0.02}
            >
              <ul className="space-y-3">
                <AnimatePresence initial={false}>
                  {comments.map((c) => (
                    <motion.li
                      key={c.id}
                      initial={reduce ? false : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.2 }}
                      className="flex gap-2"
                    >
                      <Avatar className="size-7">
                        <AvatarFallback className="text-[10px]">
                          {c.author.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 rounded-xl bg-muted/40 px-3 py-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium">
                            {c.author.username}
                          </span>
                          <div className="flex items-center gap-0.5">
                            {user?.id === c.authorId && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-6"
                                onClick={() => {
                                  setEditingCommentId(c.id);
                                  setEditingCommentBody(c.body);
                                }}
                              >
                                <Pencil className="size-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-6"
                              onClick={() => commentMut.remove.mutate(c.id)}
                            >
                              <Trash2 className="size-3" />
                            </Button>
                          </div>
                        </div>
                        {editingCommentId === c.id ? (
                          <form
                            className="mt-1 flex gap-2"
                            onSubmit={(e) => {
                              e.preventDefault();
                              if (!editingCommentBody.trim()) return;
                              commentMut.update.mutate(
                                {
                                  id: c.id,
                                  body: editingCommentBody.trim(),
                                },
                                {
                                  onSuccess: () => setEditingCommentId(null),
                                  onError: () =>
                                    toast.error(t("failedComment")),
                                },
                              );
                            }}
                          >
                            <Input
                              value={editingCommentBody}
                              onChange={(e) =>
                                setEditingCommentBody(e.target.value)
                              }
                              className="h-8"
                            />
                            <Button type="submit" size="sm">
                              Save
                            </Button>
                          </form>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">
                            {c.body.split(/(@[a-zA-Z0-9_]+)/g).map((part, i) =>
                              part.startsWith("@") ? (
                                <span
                                  key={i}
                                  className="font-medium text-primary"
                                >
                                  {part}
                                </span>
                              ) : (
                                <span key={i}>{part}</span>
                              ),
                            )}
                          </p>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-1">
                          {(c.reactions ?? []).map((r) => {
                            const mine = r.users.some((u) => u.id === user?.id);
                            return (
                              <button
                                key={r.emoji}
                                type="button"
                                className={cn(
                                  "inline-flex cursor-pointer items-center gap-1 rounded-full border px-1.5 py-0.5 text-xs transition-colors",
                                  mine
                                    ? "border-primary/40 bg-primary/10"
                                    : "border-border bg-background hover:bg-muted",
                                )}
                                onClick={() => {
                                  if (mine) {
                                    reactions.remove.mutate({
                                      commentId: c.id,
                                      emoji: r.emoji,
                                    });
                                  } else {
                                    reactions.add.mutate({
                                      commentId: c.id,
                                      emoji: r.emoji,
                                    });
                                  }
                                }}
                              >
                                <span>{r.emoji}</span>
                                <span>{r.count}</span>
                              </button>
                            );
                          })}
                          {["👍", "🎉", "👀", "❤️"].map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              className="cursor-pointer rounded-full px-1 text-xs opacity-50 hover:opacity-100"
                              onClick={() =>
                                reactions.add.mutate({
                                  commentId: c.id,
                                  emoji,
                                })
                              }
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newComment.trim()) return;
                  commentMut.create.mutate(newComment.trim(), {
                    onSuccess: () => {
                      setNewComment("");
                      reward("comment");
                    },
                    onError: () => toast.error(t("failedComment")),
                  });
                }}
              >
                <Input
                  placeholder={t("commentPlaceholder")}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="h-9"
                />
                <Button type="submit" className="relative">
                  <SuccessPulse show={pulseKey === "comment"} />
                  {tCommon("send")}
                </Button>
              </form>
            </Section>

            <Section title={t("activity")} delay={0.14}>
              <ul className="space-y-2 text-xs text-muted-foreground">
                {activity.slice(0, 20).map((ev) => (
                  <li
                    key={ev.id}
                    className="flex flex-wrap gap-x-1.5 border-s-2 border-border ps-3"
                  >
                    <span className="font-medium text-foreground">
                      {ev.actor.username}
                    </span>
                    <span>{ev.type.replace(/_/g, " ").toLowerCase()}</span>
                    <span className="text-muted-foreground/80">
                      · {formatAppDate(ev.createdAt, "d MMM HH:mm", locale)}
                    </span>
                  </li>
                ))}
                {activity.length === 0 && <li>{t("noActivity")}</li>}
              </ul>
            </Section>
              </TabsContent>
            </Tabs>
          </div>

          <aside className="space-y-5 md:sticky md:top-0 md:self-start">
            <motion.div
              className="space-y-5"
              initial={reduce ? false : { opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: 0.06 }}
            >
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer justify-start"
                  disabled={!cardId || toggleWatch.isPending}
                  onClick={() =>
                    toggleWatch.mutate(!!watchers?.watching, {
                      onSuccess: () =>
                        toast.success(
                          watchers?.watching
                            ? tWatch("unwatched")
                            : tWatch("watched"),
                        ),
                      onError: () => toast.error(tWatch("failed")),
                    })
                  }
                >
                  {watchers?.watching ? (
                    <EyeOff className="me-1.5 size-3.5" />
                  ) : (
                    <Eye className="me-1.5 size-3.5" />
                  )}
                  {watchers?.watching ? tWatch("unwatch") : tWatch("watch")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer justify-start"
                  disabled={!cardId || summarizeCard.isPending}
                  onClick={() => {
                    if (!cardId) return;
                    summarizeCard.mutate(cardId, {
                      onSuccess: (res) =>
                        toast.message(tAi("cardSummary"), {
                          description: res.summary,
                        }),
                      onError: () => toast.error(tAi("summaryFailed")),
                    });
                  }}
                >
                  <Sparkles className="me-1.5 size-3.5" />
                  {tAi("summarize")}
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">{t("assignees")}</Label>
                <div className="space-y-1.5">
                  {members.map((m) => {
                    const uid = m.user?.id ?? m.userId;
                    const name = m.user?.username ?? m.userId.slice(0, 8);
                    const on = assigneeIds.has(uid);
                    return (
                      <motion.button
                        key={uid}
                        type="button"
                        whileTap={reduce ? undefined : { scale: 0.98 }}
                        className={cn(
                          "flex w-full cursor-pointer items-center gap-2 rounded-xl px-2.5 py-2 text-start text-sm transition-colors duration-150",
                          on
                            ? "bg-primary/10 text-foreground ring-1 ring-primary/40"
                            : "bg-muted/40 hover:bg-muted",
                        )}
                        onClick={() => {
                          if (!cardId) return;
                          if (on) {
                            unassignCard.mutate({ id: cardId, userId: uid });
                          } else {
                            assignCard.mutate(
                              { id: cardId, userId: uid },
                              { onSuccess: () => reward(`assign-${uid}`) },
                            );
                          }
                        }}
                      >
                        <Avatar className="size-6">
                          <AvatarFallback className="text-[9px]">
                            {name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate">{name}</span>
                        {on && <Check className="ms-auto size-3.5 text-primary" />}
                      </motion.button>
                    );
                  })}
                  {members.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      {t("noBoardMembers")}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">{t("priority")}</Label>
                <Select
                  value={card?.priority ?? "none"}
                  onValueChange={(v) => {
                    if (!cardId) return;
                    updateCard.mutate(
                      {
                        id: cardId,
                        input: {
                          priority: v === "none" ? null : (v as CardPriority),
                        },
                      },
                      {
                        onSuccess: () => {
                          if (v !== "none") reward("priority");
                        },
                      },
                    );
                  }}
                >
                  <SelectTrigger className="h-9 relative">
                    <SuccessPulse show={pulseKey === "priority"} />
                    <SelectValue placeholder={tCommon("none")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{tCommon("none")}</SelectItem>
                    {(
                      ["LOW", "MEDIUM", "HIGH", "URGENT"] as CardPriority[]
                    ).map((p) => (
                      <SelectItem key={p} value={p}>
                        <span
                          className={cn(
                            "rounded px-1.5 py-0.5 text-[10px] font-semibold",
                            PRIORITY_COLORS[p],
                          )}
                        >
                          {p === "LOW"
                            ? t("priorityLow")
                            : p === "MEDIUM"
                              ? t("priorityMedium")
                              : p === "HIGH"
                                ? t("priorityHigh")
                                : t("priorityUrgent")}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">{t("category")}</Label>
                <Input
                  className="h-9"
                  defaultValue={card?.category ?? ""}
                  key={card?.id + (card?.category ?? "")}
                  onBlur={(e) => {
                    if (!cardId) return;
                    const v = e.target.value.trim();
                    if (v === (card?.category ?? "")) return;
                    updateCard.mutate({
                      id: cardId,
                      input: { category: v || null },
                    });
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="size-3" /> {t("dueDate")}
                </Label>
                <ShamsiDatePicker
                  value={card?.dueDate}
                  onChange={(dueDate) => {
                    if (!cardId) return;
                    updateCard.mutate(
                      { id: cardId, input: { dueDate } },
                      { onSuccess: () => reward("due") },
                    );
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="size-3" /> Start
                </Label>
                <ShamsiDatePicker
                  value={card?.startDate}
                  onChange={(startDate) => {
                    if (!cardId) return;
                    updateCard.mutate({ id: cardId, input: { startDate } });
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Estimate (min)</Label>
                <Input
                  type="number"
                  min={0}
                  className="h-9"
                  defaultValue={card?.estimateMinutes ?? ""}
                  key={`est-${card?.id}-${card?.estimateMinutes ?? ""}`}
                  onBlur={(e) => {
                    if (!cardId) return;
                    const raw = e.target.value.trim();
                    const next = raw === "" ? null : Number.parseInt(raw, 10);
                    if (next === card?.estimateMinutes) return;
                    if (next !== null && !Number.isFinite(next)) return;
                    updateCard.mutate({
                      id: cardId,
                      input: { estimateMinutes: next },
                    });
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Recurrence</Label>
                <Select
                  value={card?.recurrence ?? "NONE"}
                  onValueChange={(v) => {
                    if (!cardId) return;
                    updateCard.mutate({
                      id: cardId,
                      input: { recurrence: v as CardRecurrence },
                    });
                  }}
                >
                  <SelectTrigger className="h-9 cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["NONE", "DAILY", "WEEKLY", "MONTHLY"] as const).map(
                      (r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Timer className="size-3" /> Timer
                </Label>
                {activeTimer?.cardId === cardId ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full cursor-pointer"
                    onClick={() =>
                      stopTimer.mutate(undefined, {
                        onSuccess: () => toast.success("Timer stopped"),
                      })
                    }
                  >
                    Stop timer
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full cursor-pointer"
                    disabled={!cardId || !!activeTimer}
                    onClick={() =>
                      startTimer.mutate(cardId!, {
                        onSuccess: () => toast.success("Timer started"),
                        onError: () => toast.error("Could not start timer"),
                      })
                    }
                  >
                    Start on card
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <Label className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Link2 className="size-3" /> Blocked by
                </Label>
                <ul className="space-y-1 text-xs">
                  {deps
                    .filter((d) => d.blockedId === cardId)
                    .map((d) => (
                      <li
                        key={d.id}
                        className="flex items-center justify-between gap-2 rounded-md bg-muted/50 px-2 py-1"
                      >
                        <span className="truncate">{d.blockerTitle}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-6"
                          onClick={() => removeDep.mutate(d.id)}
                        >
                          <X className="size-3" />
                        </Button>
                      </li>
                    ))}
                </ul>
                <div className="flex gap-1">
                  <Select value={blockerPick} onValueChange={setBlockerPick}>
                    <SelectTrigger className="h-8 cursor-pointer">
                      <SelectValue placeholder="Add blocker" />
                    </SelectTrigger>
                    <SelectContent>
                      {boardCards
                        .filter((c) => c.id !== cardId)
                        .map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.title}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    className="cursor-pointer"
                    disabled={!blockerPick || !cardId}
                    onClick={() => {
                      createDep.mutate(
                        { blockerId: blockerPick, blockedId: cardId! },
                        {
                          onSuccess: () => setBlockerPick(""),
                          onError: () =>
                            toast.error("Could not add dependency"),
                        },
                      );
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>

              {cardId && card && (
                <div className="space-y-2">
                  <Label className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <GitBranch className="size-3" /> GitHub
                  </Label>
                  <CardGithubSection
                    cardId={cardId}
                    boardId={boardId}
                    cardTitle={card.title}
                    cardDescription={card.description}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  {t("coverColor")}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {LABEL_PRESET_COLORS.map((color) => {
                    const selected = card?.coverColor === color;
                    return (
                      <motion.button
                        key={color}
                        type="button"
                        whileTap={reduce ? undefined : { scale: 0.88 }}
                        className={cn(
                          "size-7 cursor-pointer rounded-full transition-shadow duration-150",
                          selected
                            ? "ring-2 ring-primary ring-offset-2 ring-offset-card"
                            : "hover:scale-105",
                        )}
                        style={{ backgroundColor: color }}
                        aria-label={t("coverAria", { color })}
                        onClick={() => {
                          if (!cardId) return;
                          updateCard.mutate(
                            {
                              id: cardId,
                              input: {
                                coverColor: color,
                                coverAttachmentId: null,
                              },
                            },
                            { onSuccess: () => reward("cover") },
                          );
                        }}
                      />
                    );
                  })}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => {
                      if (!cardId) return;
                      updateCard.mutate({
                        id: cardId,
                        input: { coverColor: null, coverAttachmentId: null },
                      });
                    }}
                  >
                    {t("clearCover")}
                  </Button>
                </div>
              </div>
            </motion.div>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
}
