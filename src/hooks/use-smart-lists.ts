"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  smartListsApi,
  type CreateSmartListInput,
  type UpdateSmartListInput,
} from "@/lib/api/smart-lists";

export const smartListKeys = {
  mine: ["smart-lists", "mine"] as const,
};

export function useSmartLists() {
  return useQuery({
    queryKey: smartListKeys.mine,
    queryFn: () => smartListsApi.listMine(),
  });
}

export function useCreateSmartList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSmartListInput) => smartListsApi.createMine(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: smartListKeys.mine });
    },
  });
}

export function useUpdateSmartList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateSmartListInput & { id: string }) =>
      smartListsApi.updateMine(id, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: smartListKeys.mine });
    },
  });
}

export function useDeleteSmartList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => smartListsApi.deleteMine(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: smartListKeys.mine });
    },
  });
}
