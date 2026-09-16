"use client";

import { useQuery } from "@tanstack/react-query";
import { myWorkApi } from "@/lib/api";

export const myWorkKeys = {
  all: ["my-work"] as const,
  inbox: () => [...myWorkKeys.all, "inbox"] as const,
};

export function useMyWork() {
  return useQuery({
    queryKey: myWorkKeys.inbox(),
    queryFn: () => myWorkApi.get(),
  });
}
