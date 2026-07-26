import type { Card, CardMoveInput } from "@/types/domain";
import type {
  CreateCardInput,
  UpdateCardInput,
  CopyCardInput,
} from "@/lib/validators";
import { apiFetch } from "./client";

export const cardsApi = {
  async create(input: CreateCardInput): Promise<Card> {
    const { boardId: _boardId, ...body } = input;
    return apiFetch<Card>("/cards", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async get(id: string): Promise<Card> {
    return apiFetch<Card>(`/cards/${id}`);
  },

  async update(id: string, input: UpdateCardInput): Promise<Card> {
    return apiFetch<Card>(`/cards/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  async remove(id: string): Promise<void> {
    await apiFetch<void>(`/cards/${id}`, { method: "DELETE" });
  },

  async move(id: string, input: CardMoveInput): Promise<Card> {
    return apiFetch<Card>(`/cards/${id}/move`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  async archive(id: string): Promise<Card> {
    return apiFetch<Card>(`/cards/${id}/archive`, { method: "POST" });
  },

  async unarchive(id: string): Promise<Card> {
    return apiFetch<Card>(`/cards/${id}/unarchive`, { method: "POST" });
  },

  async copy(id: string, input: CopyCardInput): Promise<Card> {
    return apiFetch<Card>(`/cards/${id}/copy`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async assign(id: string, userId: string): Promise<Card> {
    return apiFetch<Card>(`/cards/${id}/assign`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
  },

  async unassign(id: string, userId: string): Promise<Card> {
    return apiFetch<Card>(`/cards/${id}/assign/${userId}`, {
      method: "DELETE",
    });
  },

  async listByColumn(
    columnId: string,
    opts?: { archived?: boolean },
  ): Promise<Card[]> {
    const qs = new URLSearchParams({ columnId });
    if (opts?.archived) qs.set("archived", "true");
    return apiFetch<Card[]>(`/cards?${qs.toString()}`);
  },

  async setCover(
    id: string,
    attachmentId: string | null,
  ): Promise<Card> {
    return apiFetch<Card>(`/cards/${id}/cover`, {
      method: "POST",
      body: JSON.stringify({ attachmentId }),
    });
  },
};
