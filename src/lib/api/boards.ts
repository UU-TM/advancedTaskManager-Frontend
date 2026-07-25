import type { Board } from "@/types/domain";
import type {
  CreateBoardInput,
  UpdateBoardInput,
  CreateColumnInput,
} from "@/lib/validators";
import { apiFetch } from "./client";

/**
 * Boards API module
 * ----------------------------------------------------
 * `listByWorkspace` and `get` wait on backend routes
 * documented in the README coordination checklist.
 */

export const boardsApi = {
  async create(input: CreateBoardInput): Promise<Board> {
    return apiFetch<Board>("/boards", {
      method: "POST",
      body: JSON.stringify(input),
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
      body: JSON.stringify(input),
    });
  },
};
