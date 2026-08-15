"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { todosApi } from "@/lib/api";

export const todoKeys = {
  all: ["todos"] as const,
  list: () => [...todoKeys.all, "list"] as const,
};

export function useTodos() {
  return useQuery({
    queryKey: todoKeys.list(),
    queryFn: () => todosApi.list(),
  });
}

export function useCreateTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (title: string) => todosApi.create(title),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: todoKeys.all });
    },
  });
}

export function useUpdateTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string;
      title?: string;
      completed?: boolean;
      position?: number;
    }) => todosApi.update(id, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: todoKeys.all });
    },
  });
}

export function useDeleteTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => todosApi.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: todoKeys.all });
    },
  });
}
