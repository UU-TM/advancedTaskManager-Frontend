"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  customFieldsApi,
  type CreateCustomFieldInput,
  type UpdateCustomFieldInput,
} from "@/lib/api";
import { cardKeys } from "./use-card";

export const customFieldKeys = {
  byBoard: (boardId: string) => ["custom-fields", boardId] as const,
  values: (cardId: string) => ["custom-field-values", cardId] as const,
};

export function useBoardCustomFields(boardId: string | undefined) {
  return useQuery({
    queryKey: customFieldKeys.byBoard(boardId ?? ""),
    queryFn: () => customFieldsApi.listByBoard(boardId!),
    enabled: !!boardId,
  });
}

export function useCustomFieldMutations(boardId: string) {
  const qc = useQueryClient();
  const invalidate = () =>
    void qc.invalidateQueries({ queryKey: customFieldKeys.byBoard(boardId) });
  return {
    create: useMutation({
      mutationFn: (input: CreateCustomFieldInput) =>
        customFieldsApi.create(boardId, input),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({
        id,
        ...input
      }: { id: string } & UpdateCustomFieldInput) =>
        customFieldsApi.update(boardId, id, input),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: string) => customFieldsApi.remove(boardId, id),
      onSuccess: invalidate,
    }),
  };
}

export function useCardCustomFieldValues(cardId: string | undefined) {
  return useQuery({
    queryKey: customFieldKeys.values(cardId ?? ""),
    queryFn: () => customFieldsApi.listValues(cardId!),
    enabled: !!cardId,
  });
}

export function useSetCardCustomFieldValue(cardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ fieldId, value }: { fieldId: string; value: unknown }) =>
      customFieldsApi.setValue(cardId, fieldId, value),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: customFieldKeys.values(cardId) });
      void qc.invalidateQueries({ queryKey: cardKeys.detail(cardId) });
    },
  });
}
