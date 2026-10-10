import { Skeleton } from "@/components/ui/skeleton";

function KanbanColumnSkeletonItem() {
  return (
    <div className="flex w-[272px] shrink-0 flex-col rounded-2xl bg-[var(--kanban-list-bg)] pb-1 shadow-[var(--kanban-list-shadow)]">
      <div className="flex items-center gap-2 px-3 pt-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="ms-auto h-5 w-5 rounded" />
      </div>
      <div className="space-y-2 px-2 py-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-14 w-full rounded-lg shadow-[var(--kanban-card-shadow)]"
          />
        ))}
      </div>
    </div>
  );
}

export function KanbanColumnSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <div dir="ltr" className="flex flex-row items-start gap-3">
      {Array.from({ length: columns }).map((_, i) => (
        <KanbanColumnSkeletonItem key={i} />
      ))}
    </div>
  );
}
