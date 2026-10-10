"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table";
import { useLocale, useTranslations } from "next-intl";
import { formatAppDate } from "@/lib/date";
import type { Locale } from "@/i18n/config";
import type { BoardColumn, Card } from "@/types/domain";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useMoveCard, useUpdateCard } from "@/hooks/use-card";
import { toast } from "sonner";

type BoardTableViewProps = {
  boardId: string;
  columns: BoardColumn[];
  onOpenCard: (id: string) => void;
};

export function BoardTableView({
  columns,
  onOpenCard,
}: BoardTableViewProps) {
  const t = useTranslations("boardViews");
  const locale = useLocale() as Locale;
  const updateCard = useUpdateCard();
  const moveCard = useMoveCard();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const rows = useMemo(() => {
    const list: Array<Card & { columnTitle: string }> = [];
    for (const col of columns) {
      for (const card of col.cards ?? []) {
        list.push({ ...card, columnTitle: col.title });
      }
    }
    return list;
  }, [columns]);

  const defs = useMemo<ColumnDef<Card & { columnTitle: string }>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(!!v)}
          />
        ),
      },
      {
        accessorKey: "title",
        header: t("colTitle"),
        cell: ({ row }) => (
          <button
            type="button"
            className="cursor-pointer text-start font-medium hover:underline"
            onClick={() => onOpenCard(row.original.id)}
          >
            {row.original.title}
            {row.original.isBlocked ? (
              <span className="ms-2 text-xs text-destructive">blocked</span>
            ) : null}
          </button>
        ),
      },
      {
        accessorKey: "columnTitle",
        header: t("colList"),
      },
      {
        id: "assignees",
        header: t("colAssignees"),
        cell: ({ row }) =>
          (row.original.assignees ?? []).map((a) => a.username).join(", ") ||
          "—",
      },
      {
        id: "labels",
        header: t("colLabels"),
        cell: ({ row }) =>
          (row.original.labels ?? []).map((l) => l.name).join(", ") || "—",
      },
      {
        accessorKey: "priority",
        header: t("colPriority"),
        cell: ({ getValue }) => (getValue() as string | null) ?? "—",
      },
      {
        accessorKey: "startDate",
        header: t("colStart"),
        cell: ({ getValue }) => {
          const v = getValue() as string | null;
          return v ? formatAppDate(v, "d MMM yyyy", locale) : "—";
        },
      },
      {
        accessorKey: "dueDate",
        header: t("colDue"),
        cell: ({ getValue }) => {
          const v = getValue() as string | null;
          return v ? formatAppDate(v, "d MMM yyyy", locale) : "—";
        },
      },
      {
        accessorKey: "estimateMinutes",
        header: t("colEstimate"),
        cell: ({ getValue }) => {
          const v = getValue() as number | null;
          return v != null ? `${v}m` : "—";
        },
      },
      {
        accessorKey: "timeSpentMs",
        header: t("colTime"),
        cell: ({ getValue }) => {
          const v = (getValue() as number | undefined) ?? 0;
          if (!v) return "—";
          const mins = Math.round(v / 60000);
          return `${mins}m`;
        },
      },
    ],
    [locale, onOpenCard, t],
  );

  const table = useReactTable({
    data: rows,
    columns: defs,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.id,
  });

  const selected = table.getSelectedRowModel().rows.map((r) => r.original);
  const firstDoneColumn = columns[columns.length - 1];

  return (
    <div className="flex h-full flex-col gap-3 overflow-hidden p-4 md:p-6">
      {selected.length > 0 && firstDoneColumn && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {t("selected", { count: selected.length })}
          </span>
          <Button
            size="sm"
            variant="outline"
            className="cursor-pointer"
            onClick={() => {
              for (const card of selected) {
                moveCard.mutate(
                  {
                    id: card.id,
                    sourceColumnId: card.columnId,
                    input: { columnId: firstDoneColumn.id },
                  },
                  {
                    onError: () => toast.error(t("bulkFailed")),
                  },
                );
              }
              setRowSelection({});
            }}
          >
            {t("bulkMoveDone")}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="cursor-pointer"
            onClick={() => {
              const due = new Date();
              due.setDate(due.getDate() + 7);
              for (const card of selected) {
                updateCard.mutate(
                  {
                    id: card.id,
                    input: { dueDate: due.toISOString() },
                  },
                  { onError: () => toast.error(t("bulkFailed")) },
                );
              }
              setRowSelection({});
            }}
          >
            {t("bulkDueWeek")}
          </Button>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-auto rounded-md border border-border bg-card">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="sticky top-0 bg-muted/80 backdrop-blur">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-border">
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className="cursor-pointer px-3 py-2 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    aria-sort={
                      h.column.getIsSorted() === "asc"
                        ? "ascending"
                        : h.column.getIsSorted() === "desc"
                          ? "descending"
                          : "none"
                    }
                    onClick={h.column.getToggleSortingHandler()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        h.column.getToggleSortingHandler()?.(e);
                      }
                    }}
                    tabIndex={0}
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    {h.column.getIsSorted() === "asc" ? " ↑" : ""}
                    {h.column.getIsSorted() === "desc" ? " ↓" : ""}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-border/70 hover:bg-muted/30"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-2.5">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={defs.length}
                  className="px-3 py-10 text-center text-muted-foreground"
                >
                  {t("emptyFiltered")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
