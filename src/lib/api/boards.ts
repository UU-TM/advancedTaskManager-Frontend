import type { Board, BoardColumn } from "@/types/domain";
import type {
  CreateBoardInput,
  UpdateBoardInput,
  CreateColumnInput,
} from "@/lib/validators";
import { apiFetch } from "./client";

/**
 * Boards API module
 * ----------------------------------------------------
 * Create nests under the workspace: POST /workspaces/:id/boards.
 * List: GET /workspaces/:id/boards.
 * List columns in a board: /boards/:id/columns
 */

export const boardsApi = {
  async create(input: CreateBoardInput): Promise<Board> {
    return apiFetch<Board>(`/workspaces/${input.workspaceId}/boards`, {
      method: "POST",
      body: JSON.stringify({ name: input.name }),
    });
  },

  async listByWorkspace(workspaceId: string): Promise<Board[]> {
    return apiFetch<Board[]>(`/workspaces/${workspaceId}/boards`);
  },

  async get(id: string): Promise<Board> {
    return apiFetch<Board>(`/boards/${id}`);
  },

  async update(id: string, input: UpdateBoardInput): Promise<Board> {
    return apiFetch<Board>(`/boards/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  async remove(id: string): Promise<void> {
    await apiFetch<void>(`/boards/${id}`, { method: "DELETE" });
  },

  async addColumn(input: CreateColumnInput): Promise<Board> {
    return apiFetch<Board>(`/boards/${input.boardId}/columns`, {
      method: "POST",
      body: JSON.stringify({ title: input.name }),
    });
  },

  async listColumns(boardId: string): Promise<BoardColumn[]> {
    return apiFetch<BoardColumn[]>(`/boards/${boardId}/columns`);
  },
};
