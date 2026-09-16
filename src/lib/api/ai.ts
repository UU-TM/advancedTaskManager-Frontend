import type { WorkCard } from "@/types/domain";
import { apiFetch } from "./client";

export type WorkSuggestion = {
  rank: number;
  score: number;
  card: WorkCard;
};

export type WorkSuggestResult = {
  suggestions: WorkSuggestion[];
  source: string;
};

export type SummarizeResult = {
  summary: string;
  source: string;
};

export type NlSearchCard = {
  id: string;
  title: string;
  dueDate: string | null;
  priority: string | null;
  boardId: string;
  boardName: string;
  columnId: string;
  columnTitle: string;
};

export type NlSearchResult = {
  filters: Record<string, unknown>;
  cards: NlSearchCard[];
  source: string;
};

export const aiApi = {
  suggestNextWork() {
    return apiFetch<WorkSuggestResult>("/me/work/suggest", {
      method: "POST",
    });
  },

  summarizeBoard(boardId: string) {
    return apiFetch<SummarizeResult>(`/boards/${boardId}/summarize`, {
      method: "POST",
    });
  },

  summarizeCard(cardId: string) {
    return apiFetch<SummarizeResult>(`/cards/${cardId}/summarize`, {
      method: "POST",
    });
  },

  nlSearch(query: string) {
    return apiFetch<NlSearchResult>("/me/search/nl", {
      method: "POST",
      body: JSON.stringify({ query }),
    });
  },
};
