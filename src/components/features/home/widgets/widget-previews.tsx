import type { ReactNode } from "react";
import type { DashboardWidgetType } from "@/types/domain";
import { cn } from "@/lib/utils";

function PreviewShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none mt-3 overflow-hidden rounded-xl border border-border/50 bg-muted/30 p-2.5",
        className,
      )}
      aria-hidden
    >
      {children}
    </div>
  );
}

function Line({ className }: { className?: string }) {
  return <div className={cn("h-1.5 rounded-full bg-muted-foreground/20", className)} />;
}

function TodoPreview() {
  return (
    <PreviewShell>
      <Line className="mb-2 w-1/2" />
      <div className="mb-2 h-px bg-foreground/15" />
      <div className="space-y-1.5">
        {[false, true, false].map((done, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div
              className={cn(
                "size-2.5 shrink-0 rounded-[3px] border border-muted-foreground/30",
                done && "border-dashboard-accent bg-dashboard-accent",
              )}
            />
            <Line className={cn("flex-1", done && "opacity-40")} />
          </div>
        ))}
      </div>
    </PreviewShell>
  );
}

function TimerPreview() {
  return (
    <PreviewShell>
      <div className="flex items-center justify-between gap-2">
        <Line className="w-1/3" />
        <div className="flex gap-1">
          <div className="size-3 rounded-full bg-muted-foreground/15" />
          <div className="size-3 rounded-full bg-muted-foreground/15" />
        </div>
      </div>
      <p className="mt-2 text-center text-sm font-bold tabular-nums tracking-wider text-foreground/70">
        01:23:45
      </p>
      <div className="mt-2 flex justify-center gap-1.5">
        <div className="size-5 rounded-full bg-dashboard-accent/80" />
        <div className="size-5 rounded-full border border-muted-foreground/25" />
        <div className="size-5 rounded-full border border-muted-foreground/25" />
      </div>
    </PreviewShell>
  );
}

function ActivityPreview() {
  return (
    <PreviewShell>
      <div className="flex items-center gap-2">
        <svg viewBox="0 0 40 40" className="size-10 shrink-0">
          {[
            { r: 16, color: "#eab308", pct: 0.65 },
            { r: 12, color: "#14b8a6", pct: 0.55 },
            { r: 8, color: "#3b82f6", pct: 0.45 },
          ].map(({ r, color, pct }) => {
            const circ = 2 * Math.PI * r;
            const dash = circ * pct;
            return (
              <circle
                key={r}
                cx="20"
                cy="20"
                r={r}
                fill="none"
                stroke={color}
                strokeWidth="3"
                strokeDasharray={`${dash} ${circ}`}
                transform="rotate(-90 20 20)"
              />
            );
          })}
        </svg>
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-1">
            <div className="size-1.5 rounded-full bg-yellow-500" />
            <Line className="flex-1" />
          </div>
          <div className="flex items-center gap-1">
            <div className="size-1.5 rounded-full bg-primary" />
            <Line className="w-3/4" />
          </div>
          <div className="flex items-center gap-1">
            <div className="size-1.5 rounded-full bg-blue-500" />
            <Line className="w-2/3" />
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}

function AssignedPreview() {
  return (
    <PreviewShell>
      <div className="mb-2 flex gap-2">
        <Line className="w-8 bg-dashboard-accent/40" />
        <Line className="w-6" />
        <Line className="w-6" />
      </div>
      <div className="flex gap-2">
        <div className="size-8 shrink-0 rounded-lg bg-orange-400/70" />
        <div className="min-w-0 flex-1 space-y-1">
          <Line className="w-full" />
          <Line className="w-2/3" />
          <div className="h-1 overflow-hidden rounded-full bg-muted-foreground/15">
            <div className="h-full w-3/5 rounded-full bg-dashboard-accent/70" />
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}

function ReminderPreview() {
  return (
    <PreviewShell>
      <div className="mb-2 flex items-center justify-between">
        <Line className="w-1/3" />
        <div className="flex gap-0.5">
          <div className="size-2 rounded-sm bg-muted-foreground/20" />
          <div className="size-2 rounded-sm bg-muted-foreground/20" />
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-1.5">
        <div className="size-6 shrink-0 rounded-md bg-dashboard-accent/20" />
        <div className="flex-1 space-y-1">
          <Line className="w-full" />
          <Line className="w-1/2 opacity-60" />
        </div>
      </div>
    </PreviewShell>
  );
}

function DueSoonPreview() {
  return (
    <PreviewShell>
      <Line className="mb-2 w-1/3" />
      <div className="relative ps-3 space-y-2">
        <div className="absolute start-1 top-0 bottom-0 w-px bg-dashboard-accent/40" />
        {[true, false].map((accent, i) => (
          <div key={i} className="relative flex gap-2">
            <div
              className={cn(
                "absolute start-[-7px] top-1 size-1.5 rounded-full",
                accent ? "bg-dashboard-accent" : "bg-muted-foreground/30",
              )}
            />
            <div className="flex-1 space-y-0.5">
              <Line className="w-full" />
              <Line className="w-1/2 opacity-50" />
            </div>
          </div>
        ))}
      </div>
    </PreviewShell>
  );
}

function RecentActivityPreview() {
  return (
    <PreviewShell>
      <Line className="mb-2 w-1/3" />
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex gap-2">
            <div className="mt-0.5 size-1.5 shrink-0 rounded-full bg-dashboard-accent/70" />
            <div className="flex-1 space-y-0.5">
              <Line className="w-full" />
              <Line className="w-2/3 opacity-50" />
            </div>
          </div>
        ))}
      </div>
    </PreviewShell>
  );
}

function StarredBoardsPreview() {
  return (
    <PreviewShell>
      <Line className="mb-2 w-1/3" />
      <div className="space-y-1.5">
        {[0, 1].map((i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="size-2 shrink-0 text-[8px] leading-none text-amber-400">★</div>
            <Line className="flex-1" />
          </div>
        ))}
      </div>
    </PreviewShell>
  );
}

function RecentBoardsPreview() {
  return (
    <PreviewShell>
      <Line className="mb-2 w-1/3" />
      <div className="grid grid-cols-3 gap-1">
        {["bg-sky-400/50", "bg-amber-400/50", "bg-emerald-400/50"].map((c, i) => (
          <div key={i} className={cn("h-6 rounded-md", c)} />
        ))}
      </div>
    </PreviewShell>
  );
}

function GithubPreview() {
  return (
    <PreviewShell>
      <div className="flex items-center justify-center gap-3">
        {[
          { color: "#f97316", pct: 0.7 },
          { color: "#8b5cf6", pct: 0.45 },
        ].map(({ color, pct }, i) => (
          <div key={i} className="flex flex-col items-center gap-0.5">
            <svg viewBox="0 0 32 32" className="size-8">
              <circle
                cx="16"
                cy="16"
                r="12"
                fill="none"
                stroke="currentColor"
                className="text-muted-foreground/20"
                strokeWidth="3"
              />
              <circle
                cx="16"
                cy="16"
                r="12"
                fill="none"
                stroke={color}
                strokeWidth="3"
                strokeDasharray={`${2 * Math.PI * 12 * pct} ${2 * Math.PI * 12}`}
                transform="rotate(-90 16 16)"
              />
            </svg>
            <Line className="w-6" />
          </div>
        ))}
      </div>
    </PreviewShell>
  );
}

function NotificationsPreview() {
  return (
    <PreviewShell>
      <div className="mb-2 flex items-center justify-between">
        <Line className="w-1/3" />
        <div className="rounded-full bg-dashboard-accent px-1.5 py-px text-[8px] font-bold text-white">
          2
        </div>
      </div>
      <div className="space-y-1">
        <div className="rounded-md bg-dashboard-accent/10 p-1">
          <Line className="w-full" />
        </div>
        <Line className="w-full opacity-60" />
      </div>
    </PreviewShell>
  );
}

function MyBoardsPreview() {
  return (
    <PreviewShell>
      <Line className="mb-2 w-1/3" />
      <div className="grid grid-cols-3 gap-1">
        {["from-sky-500/40", "from-amber-500/40", "from-emerald-500/40"].map((g, i) => (
          <div
            key={i}
            className={cn("h-7 rounded-md bg-gradient-to-br to-transparent", g)}
          />
        ))}
      </div>
    </PreviewShell>
  );
}

function ChecklistPulsePreview() {
  return (
    <PreviewShell>
      <Line className="mb-2 w-1/3" />
      <div className="space-y-2">
        {[0.8, 0.45].map((pct, i) => (
          <div key={i} className="space-y-0.5">
            <Line className="w-2/3" />
            <div className="h-1 overflow-hidden rounded-full bg-muted-foreground/15">
              <div
                className="h-full rounded-full bg-dashboard-accent/70"
                style={{ width: `${pct * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </PreviewShell>
  );
}

function WeekHoursPreview() {
  return (
    <PreviewShell>
      <Line className="mb-2 w-1/3" />
      <div className="flex items-end justify-between gap-2">
        <div className="text-lg font-bold tabular-nums text-foreground/60">
          24<span className="text-[10px] font-normal">/40h</span>
        </div>
        <div className="flex h-8 items-end gap-0.5">
          {[0.4, 0.7, 0.5, 0.9, 0.3, 0.6, 0.8].map((h, i) => (
            <div
              key={i}
              className="w-1.5 rounded-sm bg-dashboard-accent/60"
              style={{ height: `${h * 100}%` }}
            />
          ))}
        </div>
      </div>
    </PreviewShell>
  );
}

function WeekStripPreview() {
  return (
    <PreviewShell>
      <Line className="mb-2 w-1/3" />
      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: 7 }, (_, i) => (
          <div
            key={i}
            className={cn(
              "flex flex-col items-center rounded-md py-1",
              i === 3 && "border border-dashboard-accent/50 bg-dashboard-accent/10",
            )}
          >
            <div className="text-[7px] text-muted-foreground">S</div>
            <div className="text-[9px] font-semibold">{i + 1}</div>
            {i === 1 || i === 4 ? (
              <div className="size-1 rounded-full bg-dashboard-accent" />
            ) : (
              <div className="size-1" />
            )}
          </div>
        ))}
      </div>
    </PreviewShell>
  );
}

const PREVIEWS: Record<DashboardWidgetType, () => ReactNode> = {
  todo: TodoPreview,
  timer: TimerPreview,
  activity: ActivityPreview,
  assigned: AssignedPreview,
  reminder: ReminderPreview,
  dueSoon: DueSoonPreview,
  recentActivity: RecentActivityPreview,
  starredBoards: StarredBoardsPreview,
  recentBoards: RecentBoardsPreview,
  github: GithubPreview,
  notifications: NotificationsPreview,
  myBoards: MyBoardsPreview,
  checklistPulse: ChecklistPulsePreview,
  weekHours: WeekHoursPreview,
  weekStrip: WeekStripPreview,
};

export function WidgetPreview({ type }: { type: DashboardWidgetType }) {
  const Preview = PREVIEWS[type];
  return <Preview />;
}
