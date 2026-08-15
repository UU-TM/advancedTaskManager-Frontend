"use client";

import { useTranslations } from "next-intl";
import { LayoutTemplate } from "lucide-react";
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
}

export function TemplateCard({ template, workspaceId }: TemplateCardProps) {
  const t = useTranslations("templates");
  const columns = template.snapshot.columns;
  const cardCount = columns.reduce((sum, c) => sum + (c.cards?.length ?? 0), 0);

  return (
    <Card className="flex flex-col transition-[border-color,box-shadow] duration-150 hover:border-primary/30 hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <LayoutTemplate className="size-4.5" />
          </div>
          {template.isSystem && (
            <Badge variant="secondary" className="font-normal">
              {t("systemBadge")}
            </Badge>
          )}
        </div>
        <CardTitle className="pt-1 text-base">{template.name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {template.description || t("noDescription")}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {columns.slice(0, 5).map((column, i) => (
            <Badge key={`${column.title}-${i}`} variant="outline" className="font-normal">
              {column.title}
            </Badge>
          ))}
          {columns.length > 5 && (
            <Badge variant="outline" className="font-normal">
              +{columns.length - 5}
            </Badge>
          )}
        </div>
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
