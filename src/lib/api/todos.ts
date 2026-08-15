import type { PersonalTodo } from "@/types/domain";
import { apiFetch } from "./client";

export const todosApi = {
  list(): Promise<PersonalTodo[]> {
    return apiFetch<PersonalTodo[]>("/me/todos");
  },

  create(title: string): Promise<PersonalTodo> {
    return apiFetch<PersonalTodo>("/me/todos", {
      method: "POST",
      body: JSON.stringify({ title }),
    });
  },

  update(
    id: string,
    data: Partial<Pick<PersonalTodo, "title" | "completed" | "position">>,
  ): Promise<PersonalTodo> {
    return apiFetch<PersonalTodo>(`/me/todos/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  remove(id: string): Promise<{ id: string }> {
    return apiFetch<{ id: string }>(`/me/todos/${id}`, { method: "DELETE" });
  },
};
