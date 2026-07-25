/**
 * Domain entities
 * ----------------------------------------------------
 * These describe the resource shapes used across the app.
 * Keep them in sync with the Zod validators in `lib/validators`.
 */

export interface User {
  id: string;
  username: string;
  /** Optional — not currently returned by the backend PublicUser DTO. */
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  /** Optional — only present when the backend rotates the refresh token. */
  refreshToken?: string;
}

export interface AuthSession {
  user: User;
  tokens: AuthTokens;
}

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  /** Optional — not returned by current backend Workspace DTO. */
  slug?: string;
  description?: string;
  memberCount?: number;
}

export interface BoardColumn {
  id: string;
  name: string;
  position: number;
  color?: string;
}

export interface CardAssignee {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
}

export interface Card {
  id: string;
  boardId: string;
  columnId: string;
  title: string;
  description?: string;
  position: number;
  labels?: string[];
  assignees?: CardAssignee[];
  dueDate?: string;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Board {
  id: string;
  workspaceId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  /** Optional — not returned by current backend Board DTO. */
  slug?: string;
  description?: string;
  columns?: BoardColumn[];
  cards?: Card[];
}

/** Shape used by the card-move endpoint. */
export interface CardMoveInput {
  targetColumnId: string;
  targetPosition: number;
}
