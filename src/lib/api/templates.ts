import type { Board, BoardTemplate } from "@/types/domain";
import { apiFetch } from "./client";

export interface CreateFromTemplateInput {
  templateId: string;
  name: string;
}

export interface SaveAsTemplateInput {
  name: string;
  description?: string;
  category?: string;
  includeCards?: boolean;
}

export const templatesApi = {
  async list(workspaceId?: string): Promise<BoardTemplate[]> {
    const qs = workspaceId
      ? `?workspaceId=${encodeURIComponent(workspaceId)}`
      : "";
    return apiFetch<BoardTemplate[]>(`/templates${qs}`);
  },

  async get(id: string): Promise<BoardTemplate> {
    return apiFetch<BoardTemplate>(`/templates/${id}`);
  },

  async createBoardFromTemplate(
    workspaceId: string,
    input: CreateFromTemplateInput,
  ): Promise<Board> {
    return apiFetch<Board>(`/workspaces/${workspaceId}/boards/from-template`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async saveAsTemplate(
    boardId: string,
    input: SaveAsTemplateInput,
  ): Promise<BoardTemplate> {
    return apiFetch<BoardTemplate>(`/boards/${boardId}/save-as-template`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};
