import type { QueryClient } from "@tanstack/react-query";
import { cardKeys } from "@/hooks/use-card";
import { columnKeys } from "@/hooks/use-columns";
import type { BoardColumn, Card } from "@/types/domain";

export type CardDragSnapshot = {
  lists: Record<string, Card[] | undefined>;
  columns: BoardColumn[] | undefined;
  columnKey: readonly unknown[];
};

export function snapshotCardDrag(
  queryClient: QueryClient,
  boardId: string,
  columnIds: string[],
): CardDragSnapshot {
  const columnKey = columnKeys.byBoard(boardId);
  const lists: Record<string, Card[] | undefined> = {};
  for (const id of columnIds) {
    const data = queryClient.getQueryData<Card[]>(cardKeys.byColumn(id));
    lists[id] = data?.map((card) => ({ ...card }));
  }
  const columns = queryClient.getQueryData<BoardColumn[]>(columnKey);
  return {
    lists,
    columns: columns?.map((col) => ({
      ...col,
      cards: col.cards?.map((card) => ({ ...card })),
    })),
    columnKey,
  };
}

export function restoreCardDrag(
  queryClient: QueryClient,
  snapshot: CardDragSnapshot,
) {
  for (const [id, cards] of Object.entries(snapshot.lists)) {
    if (!cards) continue;
    queryClient.setQueryData(cardKeys.byColumn(id), cards);
  }
  if (snapshot.columns) {
    queryClient.setQueryData(snapshot.columnKey, snapshot.columns);
  }
}

export function readColumnCards(
  queryClient: QueryClient,
  boardId: string,
  columnId: string,
): Card[] {
  const columns = queryClient.getQueryData<BoardColumn[]>(
    columnKeys.byBoard(boardId),
  );
  const embedded = columns?.find((col) => col.id === columnId)?.cards;
  if (Array.isArray(embedded)) return embedded;
  return queryClient.getQueryData<Card[]>(cardKeys.byColumn(columnId)) ?? [];
}

export function findCardPlacement(
  queryClient: QueryClient,
  boardId: string,
  columnIds: string[],
  cardId: string,
): { columnId: string; index: number } | null {
  for (const columnId of columnIds) {
    const index = readColumnCards(queryClient, boardId, columnId).findIndex(
      (card) => card.id === cardId,
    );
    if (index !== -1) return { columnId, index };
  }
  return null;
}

/** Index in the target list after the dragged card is removed. */
export function insertionIndex(
  targetCards: Card[],
  cardId: string,
  overCardId: string | null,
  placeAfter: boolean,
): number {
  const without = targetCards.filter((card) => card.id !== cardId);
  if (!overCardId) return without.length;
  const overIndex = without.findIndex((card) => card.id === overCardId);
  if (overIndex === -1) return without.length;
  return overIndex + (placeAfter ? 1 : 0);
}

export function relocateCard(
  queryClient: QueryClient,
  boardId: string,
  columnIds: string[],
  cardId: string,
  targetColumnId: string,
  insertAt: number,
) {
  const lists = new Map<string, Card[]>();
  for (const id of columnIds) {
    lists.set(id, [...readColumnCards(queryClient, boardId, id)]);
  }

  let moved: Card | undefined;
  for (const id of columnIds) {
    const list = lists.get(id);
    if (!list) continue;
    const index = list.findIndex((card) => card.id === cardId);
    if (index === -1) continue;
    moved = list[index];
    list.splice(index, 1);
    break;
  }
  if (!moved) return;

  const target = lists.get(targetColumnId) ?? [];
  const at = Math.max(0, Math.min(insertAt, target.length));
  target.splice(at, 0, { ...moved, columnId: targetColumnId });
  lists.set(targetColumnId, target);

  const columnKey = columnKeys.byBoard(boardId);
  const columns = queryClient.getQueryData<BoardColumn[]>(columnKey);
  if (columns?.some((col) => Array.isArray(col.cards))) {
    queryClient.setQueryData(
      columnKey,
      columns.map((col) => {
        const next = lists.get(col.id);
        if (!Array.isArray(col.cards) || !next) return col;
        return { ...col, cards: next };
      }),
    );
  }

  for (const id of columnIds) {
    if (queryClient.getQueryData(cardKeys.byColumn(id)) === undefined) continue;
    queryClient.setQueryData(cardKeys.byColumn(id), lists.get(id) ?? []);
  }
}
