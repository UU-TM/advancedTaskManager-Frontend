"use client";

import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TEMPLATE_COLUMN_IDS,
  TEMPLATE_DESCRIPTION_IDS,
  TEMPLATE_NAME_IDS,
  catalogText,
} from "@/lib/template-catalog";
import type { BoardTemplate } from "@/types/domain";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UseTemplateDialog } from "./use-template-dialog";

interface TemplateCardProps {
  template: BoardTemplate;
  workspaceId: string;
  featured?: boolean;
}

export function TemplateCard({ template, workspaceId, featured }: TemplateCardProps) {
  const t = useTranslations("templates");
  const catalog = useTranslations("templates.catalog");
  const name = catalogText(catalog, "names", template.name, TEMPLATE_NAME_IDS);
  const description = catalogText(
    catalog,
    "descriptions",
    template.description,
    TEMPLATE_DESCRIPTION_IDS,
  );
  const columnTitle = (title: string) =>
    catalogText(catalog, "columns", title, TEMPLATE_COLUMN_IDS);
  const columns = template.snapshot.columns;
  const labels = template.snapshot.labels ?? [];
  const cardCount = columns.reduce((sum, c) => sum + (c.cards?.length ?? 0), 0);
  const maxCards = Math.max(1, ...columns.map((c) => c.cards?.length ?? 0));

  return (
    <Card
      className={cn(
        "flex flex-col transition-[border-color,box-shadow] duration-150 hover:border-primary/30 hover:shadow-md",
        featured && "border-primary/40",
      )}
    >
      <CardHeader>
        {(featured || template.isSystem) && (
          <div className="flex items-center justify-end gap-1.5">
            {featured && (
              <Badge className="gap-1 font-normal">
                <Sparkles className="size-3" />
                {t("featuredBadge")}
              </Badge>
            )}
            {template.isSystem && (
              <Badge variant="secondary" className="font-normal">
                {t("systemBadge")}
              </Badge>
            )}
          </div>
        )}
        <CardTitle className="pt-1 text-base">{name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {description || t("noDescription")}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        <div
          className="flex h-20 items-end gap-1 overflow-hidden rounded-md border border-border/60 bg-[var(--kanban-list-bg)] p-1.5"
          aria-hidden
          dir="ltr"
        >
          {columns.slice(0, 6).map((column, i) => {
            const count = column.cards?.length ?? 0;
            return (
              <div
                key={`${column.title}-${i}`}
                className="flex h-full min-w-0 flex-1 flex-col gap-1 rounded-sm bg-card p-1"
                title={`${columnTitle(column.title)} (${count})`}
              >
                <span className="truncate text-[9px] font-medium leading-none text-foreground">
                  {columnTitle(column.title)}
                </span>
                <div className="mt-auto flex flex-col gap-0.5">
                  {Array.from({ length: Math.min(3, Math.max(count > 0 ? 1 : 0, Math.round((count / maxCards) * 3))) }).map(
                    (_, j) => (
                      <span key={j} className="h-1.5 rounded-[2px] bg-primary/35" />
                    ),
                  )}
                </div>
              </div>
            );
          })}
          {columns.length > 6 && (
            <span className="self-center px-0.5 text-[10px] text-muted-foreground">
              +{columns.length - 6}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {columns.slice(0, 4).map((column, i) => (
            <Badge key={`${column.title}-${i}`} variant="outline" className="font-normal">
              {columnTitle(column.title)}
              <span className="ms-1 text-muted-foreground">{column.cards?.length ?? 0}</span>
            </Badge>
          ))}
          {columns.length > 4 && (
            <Badge variant="outline" className="font-normal">
              +{columns.length - 4}
            </Badge>
          )}
        </div>
        {labels.length > 0 && (
          <div className="flex items-center gap-1" aria-label={t("labelsCount", { count: labels.length })}>
            {labels.slice(0, 8).map((label, i) => (
              <span
                key={`${label.name}-${i}`}
                className="size-2.5 rounded-full"
                style={{ backgroundColor: label.color }}
                title={label.name}
              />
            ))}
            <span className="ms-1 text-[11px] text-muted-foreground">
              {t("labelsCount", { count: labels.length })}
            </span>
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          {t("columnsAndCards", { columns: columns.length, cards: cardCount })}
        </p>
      </CardContent>

      <CardFooter>
        <UseTemplateDialog template={template} workspaceId={workspaceId} />
      </CardFooter>
    </Card>
  );
}
