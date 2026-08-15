import type { ComponentType } from "react";
import type {
  DashboardLayoutItem,
  DashboardWidgetType,
} from "@/types/domain";
import { TodoListWidget } from "./todo-list-widget";
import { TimeTrackerWidget } from "./time-tracker-widget";
import { ActivityWidget } from "./activity-widget";
import { AssignedTasksWidget } from "./assigned-tasks-widget";
import { ReminderWidget } from "./reminder-widget";
import { DueSoonWidget } from "./due-soon-widget";
import { RecentActivityWidget } from "./recent-activity-widget";
import { StarredBoardsWidget } from "./starred-boards-widget";
import { RecentBoardsWidget } from "./recent-boards-widget";
import { GithubSummaryWidget } from "./github-summary-widget";
import { NotificationsWidget } from "./notifications-widget";
import { MyBoardsWidget } from "./my-boards-widget";
import { ChecklistPulseWidget } from "./checklist-pulse-widget";
import { WeekHoursWidget } from "./week-hours-widget";
import { WeekStripWidget } from "./week-strip-widget";

export const DASHBOARD_COLS = 12;

export interface WidgetMeta {
  type: DashboardWidgetType;
  component: ComponentType;
  defaultW: number;
  defaultH: number;
  minW: number;
  minH: number;
}

/**
 * Default sizes use a 3-column rhythm (w=4) and shared row height (h=3)
 * so a fresh / reset layout reads as a tidy grid.
 */
export const WIDGET_REGISTRY: Record<DashboardWidgetType, WidgetMeta> = {
  todo: {
    type: "todo",
    component: TodoListWidget,
    defaultW: 4,
    defaultH: 3,
    minW: 3,
    minH: 2,
  },
  timer: {
    type: "timer",
    component: TimeTrackerWidget,
    defaultW: 4,
    defaultH: 3,
    minW: 3,
    minH: 2,
  },
  activity: {
    type: "activity",
    component: ActivityWidget,
    defaultW: 4,
    defaultH: 3,
    minW: 3,
    minH: 2,
  },
  assigned: {
    type: "assigned",
    component: AssignedTasksWidget,
    defaultW: 8,
    defaultH: 3,
    minW: 4,
    minH: 2,
  },
  reminder: {
    type: "reminder",
    component: ReminderWidget,
    defaultW: 4,
    defaultH: 3,
    minW: 3,
    minH: 2,
  },
  dueSoon: {
    type: "dueSoon",
    component: DueSoonWidget,
    defaultW: 4,
    defaultH: 3,
    minW: 3,
    minH: 2,
  },
  recentActivity: {
    type: "recentActivity",
    component: RecentActivityWidget,
    defaultW: 4,
    defaultH: 3,
    minW: 3,
    minH: 2,
  },
  starredBoards: {
    type: "starredBoards",
    component: StarredBoardsWidget,
    defaultW: 4,
    defaultH: 3,
    minW: 3,
    minH: 2,
  },
  recentBoards: {
    type: "recentBoards",
    component: RecentBoardsWidget,
    defaultW: 4,
    defaultH: 3,
    minW: 3,
    minH: 2,
  },
  github: {
    type: "github",
    component: GithubSummaryWidget,
    defaultW: 4,
    defaultH: 3,
    minW: 3,
    minH: 2,
  },
  notifications: {
    type: "notifications",
    component: NotificationsWidget,
    defaultW: 4,
    defaultH: 3,
    minW: 3,
    minH: 2,
  },
  myBoards: {
    type: "myBoards",
    component: MyBoardsWidget,
    defaultW: 4,
    defaultH: 3,
    minW: 3,
    minH: 2,
  },
  checklistPulse: {
    type: "checklistPulse",
    component: ChecklistPulseWidget,
    defaultW: 4,
    defaultH: 3,
    minW: 3,
    minH: 2,
  },
  weekHours: {
    type: "weekHours",
    component: WeekHoursWidget,
    defaultW: 4,
    defaultH: 3,
    minW: 3,
    minH: 2,
  },
  weekStrip: {
    type: "weekStrip",
    component: WeekStripWidget,
    defaultW: 8,
    defaultH: 3,
    minW: 4,
    minH: 2,
  },
};

export const ALL_WIDGET_TYPES = Object.keys(
  WIDGET_REGISTRY,
) as DashboardWidgetType[];

const STARTER_TYPES: DashboardWidgetType[] = [
  "todo",
  "timer",
  "activity",
  "reminder",
  "github",
];

function overlaps(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
): boolean {
  return !(
    a.x + a.w <= b.x ||
    b.x + b.w <= a.x ||
    a.y + a.h <= b.y ||
    b.y + b.h <= a.y
  );
}

/** Snap width to the 3-column rhythm (4 / 8 / 12). */
function snapWidth(w: number, max = DASHBOARD_COLS): number {
  const clamped = Math.min(Math.max(w, 3), max);
  if (clamped >= 10) return 12;
  if (clamped >= 6) return 8;
  return 4;
}

function snapHeight(h: number, minH: number): number {
  return Math.max(minH, Math.min(Math.max(h, 2), 6));
}

/**
 * Pack widgets left→right, top→bottom into a clean grid using
 * each type's default size (keeps order from reading position).
 */
export function packDashboardLayout(
  items: DashboardLayoutItem[],
  opts?: { useDefaults?: boolean },
): DashboardLayoutItem[] {
  const useDefaults = opts?.useDefaults ?? true;
  const ordered = [...items].sort((a, b) => a.y - b.y || a.x - b.x);
  const placed: DashboardLayoutItem[] = [];

  for (const item of ordered) {
    const meta = WIDGET_REGISTRY[item.type];
    if (!meta) continue;

    const w = useDefaults
      ? meta.defaultW
      : snapWidth(item.w, DASHBOARD_COLS);
    const h = useDefaults
      ? meta.defaultH
      : snapHeight(item.h, meta.minH);

    let x = 0;
    let y = 0;
    let found = false;

    outer: for (y = 0; y < 200; y++) {
      for (x = 0; x <= DASHBOARD_COLS - w; x++) {
        const candidate = { x, y, w, h };
        if (placed.every((p) => !overlaps(candidate, p))) {
          found = true;
          break outer;
        }
      }
    }

    if (!found) {
      y = placed.reduce((max, p) => Math.max(max, p.y + p.h), 0);
      x = 0;
    }

    placed.push({ ...item, x, y, w, h });
  }

  return placed;
}

export function createStarterLayout(
  idFactory: () => string,
): DashboardLayoutItem[] {
  const draft = STARTER_TYPES.map((type, index) => ({
    i: idFactory(),
    type,
    x: 0,
    y: index,
    w: WIDGET_REGISTRY[type].defaultW,
    h: WIDGET_REGISTRY[type].defaultH,
  }));
  return packDashboardLayout(draft);
}

/** True when positions/sizes won't sit on the tidy 3-column rhythm. */
export function isLayoutUntidy(items: DashboardLayoutItem[]): boolean {
  if (items.length === 0) return false;
  return items.some((item) => {
    const meta = WIDGET_REGISTRY[item.type];
    if (!meta) return true;
    if (item.x % 4 !== 0) return true;
    if (![4, 8, 12].includes(item.w)) return true;
    // Any height off the shared row rhythm creates stair-step gaps.
    if (item.h !== meta.defaultH) return true;
    return false;
  });
}
