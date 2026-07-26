"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cardsApi } from "@/lib/api";
import type {
  CreateCardInput,
  UpdateCardInput,
  CopyCardInput,
} from "@/lib/validators";
import type { Card, CardMoveInput } from "@/types/domain";

export const cardKeys = {
  all: ["cards"] as const,
  byColumn: (columnId: string) =>
    [...cardKeys.all, "column", columnId] as const,
  detail: (cardId: string) => [...cardKeys.all, "detail", cardId] as const,
};

export function useCards(columnId: string | undefined) {
  return useQuery({
    queryKey: cardKeys.byColumn(columnId ?? ""),
    queryFn: () => cardsApi.listByColumn(columnId!),
    enabled: !!columnId,
  });
}

export function useCard(cardId: string | undefined) {
  return useQuery({
    queryKey: cardKeys.detail(cardId ?? ""),
    queryFn: () => cardsApi.get(cardId!),
    enabled: !!cardId,
  });
}

export function useCreateCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCardInput) => cardsApi.create(input),
    onSuccess: (card) => {
      void queryClient.invalidateQueries({
        queryKey: cardKeys.byColumn(card.columnId),
      });
    },
  });
}

export function useUpdateCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCardInput }) =>
      cardsApi.update(id, input),
    onSuccess: (card) => {
      void queryClient.invalidateQueries({
        queryKey: cardKeys.byColumn(card.columnId),
      });
      void queryClient.invalidateQueries({
        queryKey: cardKeys.detail(card.id),
      });
    },
  });
}

export function useDeleteCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, columnId }: { id: string; columnId: string }) =>
      cardsApi.remove(id).then(() => ({ id, columnId })),
    onSuccess: ({ columnId }) => {
      void queryClient.invalidateQueries({
        queryKey: cardKeys.byColumn(columnId),
      });
    },
  });
}

export function useMoveCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: CardMoveInput;
      sourceColumnId: string;
    }) => cardsApi.move(id, input),
    onMutate: async ({ id, input, sourceColumnId }) => {
      await queryClient.cancelQueries({ queryKey: cardKeys.all });
      const prevSource = queryClient.getQueryData<Card[]>(
        cardKeys.byColumn(sourceColumnId),
      );
      const prevTarget = queryClient.getQueryData<Card[]>(
        cardKeys.byColumn(input.columnId),
      );

      const sourceCards = [...(prevSource ?? [])];
      const cardIndex = sourceCards.findIndex((c) => c.id === id);
      if (cardIndex === -1) return { prevSource, prevTarget };

      const [moved] = sourceCards.splice(cardIndex, 1);
      const targetCards =
        input.columnId === sourceColumnId
          ? sourceCards
          : [...(prevTarget ?? [])];

      let insertAt = targetCards.length;
      if (input.beforeCardId) {
        const i = targetCards.findIndex((c) => c.id === input.beforeCardId);
        if (i !== -1) insertAt = i;
      } else if (input.afterCardId) {
        const i = targetCards.findIndex((c) => c.id === input.afterCardId);
        if (i !== -1) insertAt = i + 1;
      }

      const nextMoved = { ...moved, columnId: input.columnId };
      targetCards.splice(insertAt, 0, nextMoved);

      if (input.columnId === sourceColumnId) {
        queryClient.setQueryData(cardKeys.byColumn(sourceColumnId), targetCards);
      } else {
        queryClient.setQueryData(cardKeys.byColumn(sourceColumnId), sourceCards);
        queryClient.setQueryData(cardKeys.byColumn(input.columnId), targetCards);
      }

      return { prevSource, prevTarget, sourceColumnId, targetColumnId: input.columnId };
    },
    onError: (_err, _vars, ctx) => {
      if (!ctx?.sourceColumnId) return;
      if (ctx.prevSource) {
        queryClient.setQueryData(
          cardKeys.byColumn(ctx.sourceColumnId),
          ctx.prevSource,
        );
      }
      if (
        ctx.prevTarget &&
        ctx.targetColumnId &&
        ctx.targetColumnId !== ctx.sourceColumnId
      ) {
        queryClient.setQueryData(
          cardKeys.byColumn(ctx.targetColumnId),
          ctx.prevTarget,
        );
      }
    },
    onSettled: (_data, _err, vars) => {
      void queryClient.invalidateQueries({
        queryKey: cardKeys.byColumn(vars.sourceColumnId),
      });
      void queryClient.invalidateQueries({
        queryKey: cardKeys.byColumn(vars.input.columnId),
      });
    },
  });
}

export function useArchiveCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; columnId: string }) =>
      cardsApi.archive(id),
    onSuccess: (_card, { columnId }) => {
      void queryClient.invalidateQueries({
        queryKey: cardKeys.byColumn(columnId),
      });
    },
  });
}

export function useCopyCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CopyCardInput }) =>
      cardsApi.copy(id, input),
    onSuccess: (card) => {
      void queryClient.invalidateQueries({
        queryKey: cardKeys.byColumn(card.columnId),
      });
    },
  });
}

export function useAssignCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      cardsApi.assign(id, userId),
    onSuccess: (card) => {
      void queryClient.invalidateQueries({
        queryKey: cardKeys.detail(card.id),
      });
      void queryClient.invalidateQueries({
        queryKey: cardKeys.byColumn(card.columnId),
      });
    },
  });
}

export function useUnassignCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      cardsApi.unassign(id, userId),
    onSuccess: (card) => {
      void queryClient.invalidateQueries({
        queryKey: cardKeys.detail(card.id),
      });
      void queryClient.invalidateQueries({
        queryKey: cardKeys.byColumn(card.columnId),
      });
    },
  });
}
