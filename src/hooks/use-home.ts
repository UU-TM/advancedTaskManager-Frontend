"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { homeApi } from "@/lib/api";

export const homeKeys = {
  all: ["home"] as const,
  dashboard: () => [...homeKeys.all, "dashboard"] as const,
  stars: () => [...homeKeys.all, "stars"] as const,
};

export function useHome() {
  return useQuery({
    queryKey: homeKeys.dashboard(),
    queryFn: () => homeApi.get(),
  });
}

export function useStarredBoards() {
  return useQuery({
    queryKey: homeKeys.stars(),
    queryFn: () => homeApi.listStars(),
  });
}

export function useStarBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (boardId: string) => homeApi.star(boardId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: homeKeys.all });
    },
  });
}

export function useUnstarBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (boardId: string) => homeApi.unstar(boardId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: homeKeys.all });
    },
  });
}