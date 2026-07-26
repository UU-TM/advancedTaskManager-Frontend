import type {
  Board,
  BoardColumn,
  BoardMember,
  ColumnMoveInput,
} from "@/types/domain";
import type {
  CreateBoardInput,
  UpdateBoardInput,
  CreateColumnInput,
  UpdateColumnInput,
} from "@/lib/validators";
import { apiFetch } from "./client";

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

  async get(
    id: string,
    include?: { columns?: boolean; cards?: boolean },
  ): Promise<Board> {
    const parts: string[] = [];
    if (include?.columns) parts.push("columns");
    if (include?.cards) parts.push("cards");
    const qs = parts.length ? `?include=${parts.join(",")}` : "";
    return apiFetch<Board>(`/boards/${id}${qs}`);
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

  async addColumn(input: CreateColumnInput): Promise<BoardColumn> {
    return apiFetch<BoardColumn>(`/boards/${input.boardId}/columns`, {
      method: "POST",
      body: JSON.stringify({ title: input.name }),
    });
  },

  async listColumns(
    boardId: string,
    opts?: { archived?: boolean },
  ): Promise<BoardColumn[]> {
    const qs = opts?.archived ? "?archived=true" : "";
    return apiFetch<BoardColumn[]>(`/boards/${boardId}/columns${qs}`);
  },

  async updateColumn(
    id: string,
    input: UpdateColumnInput,
  ): Promise<BoardColumn> {
    return apiFetch<BoardColumn>(`/columns/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  async removeColumn(id: string): Promise<void> {
    await apiFetch<void>(`/columns/${id}`, { method: "DELETE" });
  },

  async moveColumn(id: string, input: ColumnMoveInput): Promise<BoardColumn> {
    return apiFetch<BoardColumn>(`/columns/${id}/move`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  async archiveColumn(id: string): Promise<BoardColumn> {
    return apiFetch<BoardColumn>(`/columns/${id}/archive`, { method: "POST" });
  },

  async unarchiveColumn(id: string): Promise<BoardColumn> {
    return apiFetch<BoardColumn>(`/columns/${id}/unarchive`, {
      method: "POST",
    });
  },

  async listMembers(boardId: string): Promise<BoardMember[]> {
    return apiFetch<BoardMember[]>(`/boards/${boardId}/members`);
  },

  async addMember(
    boardId: string,
    input: { userId: string; role: "VIEWER" | "EDITOR" },
  ): Promise<BoardMember> {
    return apiFetch<BoardMember>(`/boards/${boardId}/members`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async removeMember(boardId: string, userId: string): Promise<void> {
    await apiFetch<void>(`/boards/${boardId}/members/${userId}`, {
      method: "DELETE",
    });
  },
};
