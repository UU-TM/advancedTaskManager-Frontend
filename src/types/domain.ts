/**
 * Domain entities — aligned with Nest/Prisma backend responses.
 */

export interface User {
  id: string;
  username: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt?: string;
}

export interface AuthTokens {
  accessToken: string;
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
  slug?: string;
  description?: string;
  memberCount?: number;
}

export type CardPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type BoardRole = "VIEWER" | "EDITOR";

export interface BoardColumn {
  id: string;
  boardId: string;
  title: string;
  position: number;
  archivedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  cards?: Card[];
}

export interface CardAssignee {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
}

export interface Label {
  id: string;
  boardId: string;
  name: string;
  color: string;
}

export interface CardCounts {
  comments: number;
  attachments: number;
  checklists: number;
}

export interface Card {
  id: string;
  columnId: string;
  title: string;
  description?: string | null;
  position: number;
  priority?: CardPriority | null;
  category?: string | null;
  assignees?: CardAssignee[];
  labels?: Label[];
  dueDate?: string | null;
  archivedAt?: string | null;
  coverColor?: string | null;
  coverAttachmentId?: string | null;
  _count?: CardCounts;
  createdAt: string;
  updatedAt?: string;
  /** @deprecated FE-only; backend does not return boardId on card */
  boardId?: string;
}

export interface Board {
  id: string;
  workspaceId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  slug?: string;
  description?: string;
  columns?: BoardColumn[];
  cards?: Card[];
}

export interface BoardMember {
  boardId: string;
  userId: string;
  role: BoardRole;
  createdAt: string;
  user?: User;
}

export interface CardMoveInput {
  columnId: string;
  afterCardId?: string;
  beforeCardId?: string;
}

export interface ColumnMoveInput {
  afterColumnId?: string;
  beforeColumnId?: string;
}

export interface ChecklistItem {
  id: string;
  checklistId: string;
  title: string;
  completed: boolean;
  position: number;
}

export interface Checklist {
  id: string;
  cardId: string;
  title: string;
  position: number;
  items: ChecklistItem[];
}

export interface Comment {
  id: string;
  cardId: string;
  authorId: string;
  author: User;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  cardId: string;
  filename: string;
  mimeType: string;
  size: number;
  createdById: string;
  createdAt: string;
  url: string;
}

export interface ActivityEvent {
  id: string;
  boardId: string;
  cardId: string | null;
  actorId: string;
  actor: User;
  type: string;
  payload: Record<string, unknown>;
  createdAt: string;
}
