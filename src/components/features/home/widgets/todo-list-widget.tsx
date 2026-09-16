"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { ListTodo, Pencil, Trash2 } from "lucide-react";
import {
  useCreateTodo,
  useDeleteTodo,
  useTodos,
  useUpdateTodo,
} from "@/hooks/use-todos";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { WidgetShell } from "./widget-shell";
import { cn } from "@/lib/utils";

export function TodoListWidget() {
  const t = useTranslations("dashboard.todo");
  const { data: todos = [], isLoading } = useTodos();
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    const title = draft.trim();
    if (!title || createTodo.isPending) return;
    await createTodo.mutateAsync(title);
    setDraft("");
  }

  return (
    <WidgetShell className="min-h-[22rem]">
      <div className="mb-3">
        <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <Pencil className="size-5 text-foreground" aria-hidden />
          {t("title")}
        </h2>
        <hr className="mt-3 border-0 border-t-2 border-foreground" />
      </div>

      <form onSubmit={(e) => void handleCreate(e)} className="mb-3">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t("createPlaceholder")}
          className="border-0 bg-transparent px-0 text-muted-foreground shadow-none focus-visible:ring-0"
        />
      </form>

      <ul className="flex-1 space-y-3 overflow-y-auto">
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        {todos.map((todo) => (
          <li key={todo.id} className="group flex items-start gap-2">
            <Checkbox
              checked={todo.completed}
              onCheckedChange={(checked) => {
                void updateTodo.mutateAsync({
                  id: todo.id,
                  completed: checked === true,
                });
              }}
              className={cn(
                "mt-0.5 size-5 rounded-[4px] border-2",
                todo.completed &&
                  "border-dashboard-accent data-[state=checked]:border-dashboard-accent data-[state=checked]:bg-dashboard-accent data-[state=checked]:text-white",
              )}
            />
            {editingId === todo.id ? (
              <form
                className="flex min-w-0 flex-1 gap-1"
                onSubmit={(e) => {
                  e.preventDefault();
                  const title = editTitle.trim();
                  if (!title) return;
                  void updateTodo
                    .mutateAsync({ id: todo.id, title })
                    .then(() => setEditingId(null));
                }}
              >
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="h-7"
                  autoFocus
                />
              </form>
            ) : (
              <button
                type="button"
                className={cn(
                  "min-w-0 flex-1 cursor-text text-start text-sm leading-snug",
                  todo.completed && "text-muted-foreground line-through",
                )}
                onDoubleClick={() => {
                  setEditingId(todo.id);
                  setEditTitle(todo.title);
                }}
              >
                {todo.title}
              </button>
            )}
            <Button
              size="icon"
              variant="ghost"
              className="size-6 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => deleteTodo.mutate(todo.id)}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </li>
        ))}
        {!isLoading && todos.length === 0 && (
          <EmptyState
            icon={ListTodo}
            title={t("emptyTitle")}
            description={t("emptyDescription")}
            className="border-0 bg-transparent py-6"
          />
        )}
      </ul>
    </WidgetShell>
  );
}
