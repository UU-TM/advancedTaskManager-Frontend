/**
 * Domain entities — aligned with Nest/Prisma backend responses.
 */

export interface User {
  id: string;
  username: string;
  email?: string;
  displayName?: string | null;
  avatarUrl?: string | null;
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

export type WorkspaceRole = "ADMIN" | "MEMBER";

export interface WorkspaceMember {
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  createdAt: string;
  user?: User;
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
  startDate?: string | null;
  estimateMinutes?: number | null;
  recurrence?: CardRecurrence;
  recurrenceUntil?: string | null;
  archivedAt?: string | null;
  /** Set by the server when the card lands in a done column / is archived. */
  completedAt?: string | null;
  coverColor?: string | null;
  coverAttachmentId?: string | null;
  blockers?: CardDependencyRef[];
  blocked?: CardDependencyRef[];
  isBlocked?: boolean;
  timeSpentMs?: number;
  locationLat?: number | null;
  locationLng?: number | null;
  locationName?: string | null;
  customFieldValues?: CardCustomFieldValue[];
  stickers?: CardSticker[];
  _count?: CardCounts;
  createdAt: string;
  updatedAt?: string;
  /** @deprecated FE-only; backend does not return boardId on card */
  boardId?: string;
}

export type CardRecurrence = "NONE" | "DAILY" | "WEEKLY" | "MONTHLY";
export type BoardViewMode =
  | "KANBAN"
  | "TABLE"
  | "CALENDAR"
  | "TIMELINE"
  | "DASHBOARD"
  | "MAP";

export interface CardDependencyRef {
  id: string;
  title: string;
  archivedAt: string | null;
}

export interface CardDependency {
  id: string;
  blockerId: string;
  blockedId: string;
  blockerTitle: string;
  blockedTitle: string;
  createdAt: string;
}

export interface WorkCard {
  id: string;
  title: string;
  dueDate: string | null;
  startDate: string | null;
  priority: CardPriority | null;
  boardId: string;
  boardName: string;
  columnId: string;
  columnTitle: string;
  archivedAt: string | null;
  isBlocked: boolean;
  estimateMinutes: number | null;
  assignees: { id: string; username: string }[];
}

export interface MyWorkInbox {
  assigned: WorkCard[];
  mentioned: WorkCard[];
  dueSoon: WorkCard[];
  overdue: WorkCard[];
  blocked: WorkCard[];
}

export interface BoardViewPrefs {
  boardId: string;
  viewMode: BoardViewMode;
  filters: Record<string, unknown> | null;
  updatedAt: string;
}

export type AutomationKind =
  | "RULE"
  | "CARD_BUTTON"
  | "BOARD_BUTTON"
  | "CALENDAR";

export type AutomationTriggerType =
  | "CARD_MOVED"
  | "CARD_ASSIGNED"
  | "DUE_SOON"
  | "CHECKLIST_COMPLETE"
  | "GITHUB_PR_MERGED"
  | "MANUAL"
  | "SCHEDULE";

export type AutomationActionType =
  | "MOVE_TO_COLUMN"
  | "ADD_LABEL"
  | "REMOVE_LABEL"
  | "ASSIGN_USER"
  | "UNASSIGN_USER"
  | "SET_DUE_DAYS"
  | "CLEAR_DUE"
  | "SET_PRIORITY"
  | "MARK_COMPLETE"
  | "ARCHIVE_CARD"
  | "NOTIFY"
  | "CREATE_REMINDER"
  | "CREATE_CARD"
  | "MOVE_ALL_CARDS"
  | "ARCHIVE_ALL_IN_COLUMN";

export interface AutomationSchedule {
  frequency: "DAILY" | "WEEKLY" | "MONTHLY";
  hour: number;
  minute?: number;
  /** 0 = Sunday … 6 = Saturday (WEEKLY) */
  weekday?: number;
  /** 1–31 (MONTHLY) */
  dayOfMonth?: number;
  timezone?: string;
  lastRunAt?: string;
}

export interface AutomationAction {
  type: AutomationActionType;
  columnId?: string;
  targetColumnId?: string;
  labelId?: string;
  userId?: string;
  days?: number;
  message?: string;
  title?: string;
  description?: string;
  priority?: CardPriority;
}

export interface BoardAutomation {
  id: string;
  boardId: string;
  name: string;
  enabled: boolean;
  kind?: AutomationKind;
  trigger?: {
    type: AutomationTriggerType;
    columnId?: string;
    hoursBeforeDue?: number;
  };
  conditions: Record<string, unknown> | null;
  actions: AutomationAction[];
  schedule?: AutomationSchedule | null;
  buttonLabel?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type BoardKind = "KANBAN" | "WHITEBOARD";

export interface Board {
  id: string;
  workspaceId: string;
  ownerId?: string;
  name: string;
  kind?: BoardKind;
  createdAt: string;
  updatedAt: string;
  slug?: string;
  description?: string;
  backgroundType?: BoardBackgroundType | null;
  backgroundValue?: string | null;
  prefs?: BoardPrefs | null;
  columns?: BoardColumn[];
  cards?: Card[];
}

export type BoardBackgroundType = "COLOR" | "GRADIENT" | "IMAGE";

export interface BoardPrefs {
  showLabelText?: boolean;
  coverSize?: "normal" | "full";
  [key: string]: unknown;
}

/* ------------------------------------------------------------------ */
/* Custom fields, power-ups, stickers, board dashboard                */
/* ------------------------------------------------------------------ */

export type CustomFieldType = "TEXT" | "NUMBER" | "DATE" | "CHECKBOX" | "LIST";

export interface CustomFieldOption {
  id?: string;
  label: string;
  color?: string;
}

export interface CustomFieldDef {
  id: string;
  boardId: string;
  name: string;
  type: CustomFieldType;
  options: CustomFieldOption[] | null;
  position: number;
  createdAt: string;
}

export interface CardCustomFieldValue {
  fieldId: string;
  cardId?: string;
  value: unknown;
}

export interface BoardPowerUp {
  packId: string;
  name: string;
  description: string;
  snapshot: unknown;
  attached: boolean;
  enabled: boolean;
  config: Record<string, unknown> | null;
}

export interface Sticker {
  id: string;
  packId: string;
  name: string;
  imageUrl: string;
}

export interface StickerPack {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  marketplacePackId: string | null;
  stickers: Sticker[];
}

export interface CardSticker {
  id: string;
  cardId?: string;
  stickerId: string;
  name: string;
  imageUrl: string;
  x: number;
  y: number;
  rotate: number;
  zIndex: number;
}

export interface BoardDashboard {
  boardId: string;
  generatedAt: string;
  totals: {
    cards: number;
    completed: number;
    overdue: number;
    dueSoon: number;
    unassigned: number;
    noDueDate: number;
  };
  byColumn: { columnId: string; title: string; count: number }[];
  byLabel: { labelId: string; name: string; color: string; count: number }[];
  byMember: {
    userId: string;
    username: string;
    count: number;
    overdue: number;
  }[];
}

export interface BoardArchived {
  columns: BoardColumn[];
  cards: Card[];
}

export interface Milestone {
  id: string;
  workspaceId: string;
  name: string;
  dueDate: string | null;
  cardIds?: string[];
  createdAt: string;
}

export interface SmartList {
  id: string;
  userId: string | null;
  workspaceId: string | null;
  name: string;
  filters: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface OutboundWebhook {
  id: string;
  workspaceId: string;
  url: string;
  events: string[];
  enabled: boolean;
  createdAt: string;
}

export type InvitationStatus =
  | "PENDING"
  | "ACCEPTED"
  | "DECLINED"
  | "CANCELLED";

export interface WorkspaceInvitation {
  id: string;
  workspaceId: string;
  inviterId: string;
  inviteeUserId: string | null;
  inviteeUsername: string;
  role: WorkspaceRole;
  status: InvitationStatus;
  createdAt: string;
  respondedAt: string | null;
  workspaceName?: string;
  inviter?: User;
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

export interface CommentReactionSummary {
  emoji: string;
  count: number;
  users: User[];
}

export interface Comment {
  id: string;
  cardId: string;
  authorId: string;
  author: User;
  body: string;
  mentions?: User[];
  reactions?: CommentReactionSummary[];
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

/* ------------------------------------------------------------------ */
/* Templates                                                          */
/* ------------------------------------------------------------------ */

export interface TemplateSnapshotCard {
  title: string;
  description?: string;
  priority?: CardPriority;
}

export interface TemplateSnapshotColumn {
  title: string;
  cards?: TemplateSnapshotCard[];
}

export interface TemplateSnapshotLabel {
  name: string;
  color: string;
}

export interface TemplateSnapshot {
  columns: TemplateSnapshotColumn[];
  labels?: TemplateSnapshotLabel[];
}

export interface BoardTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  isSystem: boolean;
  workspaceId: string | null;
  createdById: string | null;
  snapshot: TemplateSnapshot;
  createdAt: string;
  updatedAt: string;
}

/* ------------------------------------------------------------------ */
/* Home dashboard                                                     */
/* ------------------------------------------------------------------ */

export interface HomeAssignedCard {
  id: string;
  title: string;
  dueDate: string | null;
  priority: CardPriority | null;
  boardId: string;
  boardName: string;
  columnId: string;
  columnTitle: string;
  archivedAt: string | null;
  assignees: CardAssignee[];
  completedChecklistItems: number;
  totalChecklistItems: number;
}

export interface HomeGithubSummary {
  openIssues: number;
  openPrs: number;
  connected: boolean;
}

export interface HomeDashboard {
  recentBoards: Board[];
  starredBoards: Board[];
  assignedCards: HomeAssignedCard[];
  dueSoon: HomeAssignedCard[];
  recentActivity: ActivityEvent[];
  githubSummary: HomeGithubSummary;
}

export interface BoardStar {
  userId: string;
  boardId: string;
  createdAt: string;
}

export interface PersonalTodo {
  id: string;
  title: string;
  completed: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export type TimeEntryStatus = "RUNNING" | "PAUSED" | "STOPPED";

export interface TimeEntry {
  id: string;
  cardId?: string | null;
  boardId?: string | null;
  startedAt: string;
  endedAt: string | null;
  pausedAt: string | null;
  elapsedMs: number;
  status: TimeEntryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  id: string;
  title: string;
  scheduledAt: string;
  linkUrl: string | null;
  cardId: string | null;
  boardId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  href: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface StatMetric {
  value: number;
  target: number;
}

export interface ActivityStatsPage {
  key: "current" | "previous" | "targets";
  label: string;
  workingHours: StatMetric;
  tasksCompleted: StatMetric;
  projectsCompleted: StatMetric;
}

export interface ActivityStats {
  range: "weekly" | "daily";
  pages: ActivityStatsPage[];
}

export interface SearchResult {
  boards: { id: string; name: string; workspaceId: string }[];
  cards: {
    id: string;
    title: string;
    boardId: string;
    boardName: string;
    columnId: string;
  }[];
}

/* ------------------------------------------------------------------ */
/* API tokens (MCP)                                                   */
/* ------------------------------------------------------------------ */

export interface ApiToken {
  id: string;
  name: string;
  tokenPrefix: string;
  scopes: string[];
  lastUsedAt: string | null;
  createdAt: string;
  revokedAt: string | null;
}

export interface CreatedApiToken extends ApiToken {
  token: string;
}

/* ------------------------------------------------------------------ */
/* GitHub integration                                                 */
/* ------------------------------------------------------------------ */

export interface GithubConnectionStatus {
  connected: boolean;
  login: string | null;
}

export interface GithubRepoSummary {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  private: boolean;
  htmlUrl: string;
  description: string | null;
  updatedAt: string;
}

export interface GithubRepoLink {
  id: string;
  boardId: string;
  owner: string;
  repo: string;
  syncIssues: boolean;
  syncPulls: boolean;
  autoCreateCards: boolean;
  webhookId: string | null;
  createdAt: string;
  updatedAt: string;
}

export type GithubItemKind = "ISSUE" | "PR";
export type GithubItemState = "OPEN" | "CLOSED" | "MERGED";

export interface GithubItem {
  id: string;
  repoLinkId: string;
  kind: GithubItemKind;
  number: number;
  title: string;
  state: GithubItemState;
  url: string;
  draft: boolean;
  reviewState: string | null;
  authorLogin: string | null;
  syncedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CardGithubLink {
  id: string;
  cardId: string;
  githubItemId: string;
  createdAt: string;
  githubItem: GithubItem;
}

export interface GithubSyncResult {
  issuesSynced: number;
  pullsSynced: number;
}
