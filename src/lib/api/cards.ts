import type { Card, CardMoveInput } from "@/types/domain";
import type { CreateCardInput, UpdateCardInput } from "@/lib/validators";
import { apiFetch } from "./client";

/**
 * Cards API module
 * ----------------------------------------------------
 * Full CRUD + move + assign endpoints. Stubs until the
 * backend is wired up; signatures should remain stable.
 */

export const cardsApi = {
  async create(input: CreateCardInput): Promise<Card> {
    return apiFetch<Card>("/cards", {
      method: "POST",
      body: JSON.stringify(input),
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
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async assign(id: string, userId: string): Promise<Card> {
    return apiFetch<Card>(`/cards/${id}/assignees`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
  },

  async unassign(id: string, userId: string): Promise<Card> {
    return apiFetch<Card>(`/cards/${id}/assignees/${userId}`, {
      method: "DELETE",
    });
  },
};
