"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { ListTodo, Pencil } from "lucide-react";
import {
  useCreateTodo,
  useTodos,
  useUpdateTodo,
} from "@/hooks/use-todos";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { WidgetShell } from "./widget-shell";
import { cn } from "@/lib/utils";

export function TodoListWidget() {
  const t = useTranslations("dashboard.todo");
  const { data: todos = [], isLoading } = useTodos();
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  const [draft, setDraft] = useState("");

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
          <li key={todo.id} className="flex items-start gap-3">
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
            <span
              className={cn(
                "text-sm leading-snug",
                todo.completed && "text-muted-foreground line-through",
              )}
            >
              {todo.title}
            </span>
          </li>
        ))}
      </ul>
      {!isLoading && todos.length === 0 && (
        <EmptyState
          icon={ListTodo}
          title={t("emptyTitle")}
          description={t("emptyDescription")}
        />
      )}
    </WidgetShell>
  );
}
