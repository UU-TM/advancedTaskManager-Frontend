"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cardsApi } from "@/lib/api";
import { columnKeys } from "./use-columns";
import type {
  CreateCardInput,
  UpdateCardInput,
  CopyCardInput,
} from "@/lib/validators";
import type { BoardColumn, Card, CardMoveInput } from "@/types/domain";

export const cardKeys = {
  all: ["cards"] as const,
  byColumn: (columnId: string) =>
    [...cardKeys.all, "column", columnId] as const,
  detail: (cardId: string) => [...cardKeys.all, "detail", cardId] as const,
};

function invalidateColumns(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: columnKeys.all });
}

/** Keep cards nested on the board-column query in sync with drag optimism. */
function moveEmbeddedCard(
  queryClient: ReturnType<typeof useQueryClient>,
  id: string,
  sourceColumnId: string,
  input: CardMoveInput,
) {
  const entries = queryClient.getQueriesData<BoardColumn[]>({
    queryKey: columnKeys.all,
  });
  for (const [key, cols] of entries) {
    if (!cols?.some((col) => col.cards)) continue;
    const next = cols.map((col) => ({
      ...col,
      cards: col.cards ? [...col.cards] : col.cards,
    }));
    const source = next.find((col) => col.id === sourceColumnId);
    if (!source?.cards) continue;
    const index = source.cards.findIndex((card) => card.id === id);
    if (index === -1) continue;
    const [moved] = source.cards.splice(index, 1);
    const target =
      input.columnId === sourceColumnId
        ? source
        : next.find((col) => col.id === input.columnId);
    if (!target) continue;
    const targetCards = target.cards ? [...target.cards] : [];
    if (target === source) {
      // `source.cards` was already spliced.
    }
    const list = target === source ? source.cards! : targetCards;
    let insertAt = list.length;
    if (input.beforeCardId) {
      const i = list.findIndex((card) => card.id === input.beforeCardId);
      if (i !== -1) insertAt = i;
    } else if (input.afterCardId) {
      const i = list.findIndex((card) => card.id === input.afterCardId);
      if (i !== -1) insertAt = i + 1;
    }
    list.splice(insertAt, 0, { ...moved, columnId: input.columnId });
    if (target !== source) target.cards = list;
    queryClient.setQueryData(key, next);
  }
}

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
    onMutate: async (input) => {
      await queryClient.cancelQueries({
        queryKey: cardKeys.byColumn(input.columnId),
      });
      const prev = queryClient.getQueryData<Card[]>(
        cardKeys.byColumn(input.columnId),
      );
      const optimistic: Card = {
        id: `temp-${crypto.randomUUID()}`,
        columnId: input.columnId,
        title: input.title,
        position: (prev?.length ?? 0) + 1,
        createdAt: new Date().toISOString(),
      };
      queryClient.setQueryData<Card[]>(cardKeys.byColumn(input.columnId), [
        ...(prev ?? []),
        optimistic,
      ]);
      return { prev, columnId: input.columnId };
    },
    onError: (_err, _input, ctx) => {
      if (ctx?.columnId) {
        queryClient.setQueryData(cardKeys.byColumn(ctx.columnId), ctx.prev);
      }
    },
    onSuccess: (card) => {
      void queryClient.invalidateQueries({
        queryKey: cardKeys.byColumn(card.columnId),
      });
      invalidateColumns(queryClient);
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
      invalidateColumns(queryClient);
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
      invalidateColumns(queryClient);
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
      await queryClient.cancelQueries({ queryKey: columnKeys.all });
      moveEmbeddedCard(queryClient, id, sourceColumnId, input);
      const prevSource = queryClient.getQueryData<Card[]>(
        cardKeys.byColumn(sourceColumnId),
      );
      const prevTarget = queryClient.getQueryData<Card[]>(
        cardKeys.byColumn(input.columnId),
      );

      const sourceCards = [...(prevSource ?? [])];
      const cardIndex = sourceCards.findIndex((c) => c.id === id);
      if (cardIndex === -1) {
        return { prevSource, prevTarget, sourceColumnId, targetColumnId: input.columnId };
      }

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
      invalidateColumns(queryClient);
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
      invalidateColumns(queryClient);
    },
  });
}

export function useUnarchiveCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; columnId: string }) =>
      cardsApi.unarchive(id),
    onSuccess: (_card, { columnId }) => {
      void queryClient.invalidateQueries({
        queryKey: cardKeys.byColumn(columnId),
      });
      invalidateColumns(queryClient);
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
      invalidateColumns(queryClient);
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
      void queryClient.invalidateQueries({ queryKey: ["home"] });
      invalidateColumns(queryClient);
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
      invalidateColumns(queryClient);
    },
  });
}
