import { Skeleton } from "@/components/ui/skeleton";

function KanbanColumnSkeletonItem() {
  return (
    <div className="flex w-72 shrink-0 flex-col rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="ms-auto h-5 w-5 rounded" />
      </div>
      <div className="space-y-2 p-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export function KanbanColumnSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <div dir="ltr" className="flex flex-row items-start gap-4">
      {Array.from({ length: columns }).map((_, i) => (
        <KanbanColumnSkeletonItem key={i} />
      ))}
    </div>
  );
}
