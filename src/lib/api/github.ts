import type {
  CardGithubLink,
  GithubConnectionStatus,
  GithubItem,
  GithubItemKind,
  GithubItemState,
  GithubRepoLink,
  GithubRepoSummary,
  GithubSyncResult,
} from "@/types/domain";
import { API_BASE_URL, apiFetch, getAccessToken } from "./client";

export interface LinkRepoInput {
  owner: string;
  repo: string;
  syncIssues?: boolean;
  syncPulls?: boolean;
  autoCreateCards?: boolean;
}

export interface LinkCardGithubInput {
  githubItemId?: string;
  kind?: GithubItemKind;
  number?: number;
}

export interface CreateGithubIssueInput {
  title: string;
  body?: string;
}

/**
 * Build the browser-navigation URL for the GitHub OAuth connect flow.
 * `window.location.href` navigations can't carry an Authorization header,
 * so the backend JWT strategy also accepts the token as an `access_token`
 * query parameter for this one redirect-based endpoint.
 */
export function getGithubConnectUrl(): string {
  const token = getAccessToken();
  const qs = token ? `?access_token=${encodeURIComponent(token)}` : "";
  return `${API_BASE_URL}/integrations/github/connect${qs}`;
}

export const githubApi = {
  async getStatus(): Promise<GithubConnectionStatus> {
    return apiFetch<GithubConnectionStatus>("/integrations/github");
  },

  async disconnect(): Promise<GithubConnectionStatus> {
    return apiFetch<GithubConnectionStatus>("/integrations/github", {
      method: "DELETE",
    });
  },

  async listRepos(): Promise<GithubRepoSummary[]> {
    return apiFetch<GithubRepoSummary[]>("/integrations/github/repos");
  },

  async linkBoardRepo(
    boardId: string,
    input: LinkRepoInput,
  ): Promise<GithubRepoLink> {
    return apiFetch<GithubRepoLink>(`/boards/${boardId}/github`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async getBoardRepoLink(boardId: string): Promise<GithubRepoLink> {
    return apiFetch<GithubRepoLink>(`/boards/${boardId}/github`);
  },

  async unlinkBoardRepo(boardId: string): Promise<void> {
    await apiFetch<void>(`/boards/${boardId}/github`, { method: "DELETE" });
  },

  async listBoardItems(
    boardId: string,
    filters?: { kind?: GithubItemKind; state?: GithubItemState },
  ): Promise<GithubItem[]> {
    const params = new URLSearchParams();
    if (filters?.kind) params.set("kind", filters.kind);
    if (filters?.state) params.set("state", filters.state);
    const qs = params.toString();
    return apiFetch<GithubItem[]>(
      `/boards/${boardId}/github/items${qs ? `?${qs}` : ""}`,
    );
  },

  async syncBoard(boardId: string): Promise<GithubSyncResult> {
    return apiFetch<GithubSyncResult>(`/boards/${boardId}/github/sync`, {
      method: "POST",
    });
  },

  async listCardLinks(cardId: string): Promise<CardGithubLink[]> {
    return apiFetch<CardGithubLink[]>(`/cards/${cardId}/github`);
  },

  async linkCard(
    cardId: string,
    input: LinkCardGithubInput,
  ): Promise<CardGithubLink> {
    return apiFetch<CardGithubLink>(`/cards/${cardId}/github/link`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async unlinkCard(cardId: string, linkId: string): Promise<void> {
    await apiFetch<void>(`/cards/${cardId}/github/link/${linkId}`, {
      method: "DELETE",
    });
  },

  async createIssue(
    cardId: string,
    input: CreateGithubIssueInput,
  ): Promise<CardGithubLink> {
    return apiFetch<CardGithubLink>(`/cards/${cardId}/github/create-issue`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};
