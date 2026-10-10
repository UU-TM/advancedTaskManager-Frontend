/** English seed copy → i18n id under templates.catalog. */
export const TEMPLATE_NAME_IDS: Record<string, string> = {
  "Basic Kanban": "basicKanban",
  "Sprint Board": "sprintBoard",
  "Bug Triage": "bugTriage",
  "Content Calendar": "contentCalendar",
  "Personal Tasks": "personalTasks",
  "Hiring Pipeline": "hiringPipeline",
  "Product Launch": "productLaunch",
  "Support Inbox": "supportInbox",
};

export const TEMPLATE_CATEGORY_IDS: Record<string, string> = {
  Productivity: "productivity",
  Engineering: "engineering",
  Marketing: "marketing",
  Personal: "personal",
  HR: "hr",
  Product: "product",
  Support: "support",
};

export const TEMPLATE_COLUMN_IDS: Record<string, string> = {
  "To Do": "toDo",
  "In Progress": "inProgress",
  Done: "done",
  Backlog: "backlog",
  "Sprint Ready": "sprintReady",
  "In Review": "inReview",
  Reported: "reported",
  Triaged: "triaged",
  Fixing: "fixing",
  Verified: "verified",
  Closed: "closed",
  Ideas: "ideas",
  Writing: "writing",
  Editing: "editing",
  Scheduled: "scheduled",
  Published: "published",
  Inbox: "inbox",
  Today: "today",
  "This Week": "thisWeek",
  Applied: "applied",
  Screening: "screening",
  Interview: "interview",
  Offer: "offer",
  Hired: "hired",
  Planning: "planning",
  Building: "building",
  QA: "qa",
  "Launch Ready": "launchReady",
  Shipped: "shipped",
  New: "new",
  Investigating: "investigating",
  "Waiting on customer": "waitingOnCustomer",
  Resolved: "resolved",
};

export const TEMPLATE_DESCRIPTION_IDS: Record<string, string> = {
  "Classic To Do → In Progress → Done workflow.": "basicKanban",
  "Agile sprint columns with backlog and review.": "sprintBoard",
  "Track and prioritize defects from report to fix.": "bugTriage",
  "Plan drafts through publish for content teams.": "contentCalendar",
  "Simple personal board for daily priorities.": "personalTasks",
  "Candidate stages from application to offer.": "hiringPipeline",
  "Coordinate launch work across teams.": "productLaunch",
  "Customer support ticket workflow.": "supportInbox",
};

type CatalogT = {
  (key: string): string;
  has: (key: string) => boolean;
};

export function catalogText(
  t: CatalogT,
  group: "names" | "categories" | "columns" | "descriptions",
  value: string | null | undefined,
  ids: Record<string, string>,
): string {
  if (!value) return "";
  const id = ids[value];
  if (!id) return value;
  const key = `${group}.${id}`;
  return t.has(key) ? t(key) : value;
}
