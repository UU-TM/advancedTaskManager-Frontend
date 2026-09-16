import type { MyWorkInbox } from "@/types/domain";
import { apiFetch } from "./client";

export const myWorkApi = {
  get(): Promise<MyWorkInbox> {
    return apiFetch<MyWorkInbox>("/me/work");
  },
};
