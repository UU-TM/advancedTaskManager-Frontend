"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { remindersApi, type CreateReminderInput } from "@/lib/api";

export const reminderKeys = {
  all: ["reminders"] as const,
  list: () => [...reminderKeys.all, "list"] as const,
};

export function useReminders() {
  return useQuery({
    queryKey: reminderKeys.list(),
    queryFn: () => remindersApi.list(),
  });
}

export function useCreateReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateReminderInput) => remindersApi.create(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: reminderKeys.all });
    },
  });
}

export function useDeleteReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => remindersApi.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: reminderKeys.all });
    },
  });
}
