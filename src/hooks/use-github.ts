"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { githubApi } from "@/lib/api";
import type {
  CreateGithubIssueInput,
  LinkCardGithubInput,
  LinkRepoInput,
} from "@/lib/api/github";
import type { GithubItemKind, GithubItemState } from "@/types/domain";
import { homeKeys } from "./use-home";

export const githubKeys = {
  all: ["github"] as const,
  status: () => [...githubKeys.all, "status"] as const,
  repos: () => [...githubKeys.all, "repos"] as const,
  boardRepo: (boardId: string) =>
    [...githubKeys.all, "board", boardId] as const,
  boardItems: (
    boardId: string,
    filters?: { kind?: GithubItemKind; state?: GithubItemState },
  ) =>
    [
      ...githubKeys.all,
      "board",
      boardId,
      "items",
      filters?.kind ?? "",
      filters?.state ?? "",
    ] as const,
  cardLinks: (cardId: string) =>
    [...githubKeys.all, "card", cardId] as const,
};

export function useGithubStatus() {
  return useQuery({
    queryKey: githubKeys.status(),
    queryFn: () => githubApi.getStatus(),
  });
}

export function useDisconnectGithub() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => githubApi.disconnect(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: githubKeys.all });
      void queryClient.invalidateQueries({ queryKey: homeKeys.all });
    },
  });
}

export function useGithubRepos(enabled: boolean) {
  return useQuery({
    queryKey: githubKeys.repos(),
    queryFn: () => githubApi.listRepos(),
    enabled,
  });
}

export function useBoardGithubRepo(boardId: string | undefined) {
  return useQuery({
    queryKey: githubKeys.boardRepo(boardId ?? ""),
    queryFn: async () => {
      try {
        return await githubApi.getBoardRepoLink(boardId!);
      } catch {
        return null;
      }
    },
    enabled: !!boardId,
  });
}

export function useLinkBoardRepo(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LinkRepoInput) =>
      githubApi.linkBoardRepo(boardId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: githubKeys.boardRepo(boardId),
      });
    },
  });
}

export function useUnlinkBoardRepo(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => githubApi.unlinkBoardRepo(boardId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: githubKeys.boardRepo(boardId),
      });
      void queryClient.invalidateQueries({
        queryKey: [...githubKeys.all, "board", boardId, "items"],
      });
    },
  });
}

export function useBoardGithubItems(
  boardId: string | undefined,
  filters?: { kind?: GithubItemKind; state?: GithubItemState },
  enabled = true,
) {
  return useQuery({
    queryKey: githubKeys.boardItems(boardId ?? "", filters),
    queryFn: () => githubApi.listBoardItems(boardId!, filters),
    enabled: !!boardId && enabled,
  });
}

export function useSyncBoardRepo(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => githubApi.syncBoard(boardId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [...githubKeys.all, "board", boardId, "items"],
      });
    },
  });
}

export function useCardGithubLinks(cardId: string | undefined) {
  return useQuery({
    queryKey: githubKeys.cardLinks(cardId ?? ""),
    queryFn: () => githubApi.listCardLinks(cardId!),
    enabled: !!cardId,
  });
}

export function useLinkCardToGithub(cardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LinkCardGithubInput) =>
      githubApi.linkCard(cardId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: githubKeys.cardLinks(cardId),
      });
    },
  });
}

export function useUnlinkCardFromGithub(cardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (linkId: string) => githubApi.unlinkCard(cardId, linkId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: githubKeys.cardLinks(cardId),
      });
    },
  });
}

export function useCreateGithubIssueForCard(cardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateGithubIssueInput) =>
      githubApi.createIssue(cardId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: githubKeys.cardLinks(cardId),
      });
    },
  });
}
