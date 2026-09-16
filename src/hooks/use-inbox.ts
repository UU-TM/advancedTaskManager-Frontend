"use client";

import { useQuery } from "@tanstack/react-query";
import { inboxApi } from "@/lib/api";

export const inboxKeys = {
  all: ["inbox"] as const,
  list: () => [...inboxKeys.all, "list"] as const,
};

export function useInbox() {
  return useQuery({
    queryKey: inboxKeys.list(),
    queryFn: () => inboxApi.get(),
  });
}
