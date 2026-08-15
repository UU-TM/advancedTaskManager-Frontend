import type { ApiToken, CreatedApiToken } from "@/types/domain";
import { apiFetch } from "./client";

export interface CreateApiTokenInput {
  name: string;
  scopes?: string[];
}

export const apiTokensApi = {
  async list(): Promise<ApiToken[]> {
    return apiFetch<ApiToken[]>("/me/api-tokens");
  },

  async create(input: CreateApiTokenInput): Promise<CreatedApiToken> {
    return apiFetch<CreatedApiToken>("/me/api-tokens", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async revoke(id: string): Promise<ApiToken> {
    return apiFetch<ApiToken>(`/me/api-tokens/${id}`, { method: "DELETE" });
  },
};
