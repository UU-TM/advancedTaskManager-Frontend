"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { shareLinksApi, type CreateShareLinkInput } from "@/lib/api";

export const shareLinkKeys = {
  all: ["share-links"] as const,
  board: (boardId: string) => [...shareLinkKeys.all, boardId] as const,
};

export function useShareLinks(boardId: string | undefined) {
  return useQuery({
    queryKey: shareLinkKeys.board(boardId ?? ""),
    queryFn: () => shareLinksApi.list(boardId!),
    enabled: !!boardId,
  });
}

export function useCreateShareLink(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateShareLinkInput = {}) =>
      shareLinksApi.create(boardId, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: shareLinkKeys.board(boardId) });
    },
  });
}

export function useRevokeShareLink(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (linkId: string) => shareLinksApi.revoke(boardId, linkId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: shareLinkKeys.board(boardId) });
    },
  });
}
