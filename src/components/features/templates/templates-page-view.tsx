"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { LayoutTemplate } from "lucide-react";
import { useActiveWorkspace } from "@/components/layout/active-workspace-context";
import { useTemplates } from "@/hooks/use-templates";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/utils";
import { TemplateCard } from "./template-card";

function TemplatesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-xl border border-border bg-card p-5">
          <Skeleton className="size-9 rounded-lg" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="mt-2 h-8 w-full" />
        </div>
      ))}
    </div>
  );
}

/**
 * Template gallery — pick a system or workspace template to spin up a
 * new board pre-populated with columns, cards, and labels.
 */
export function TemplatesPageView() {
  const t = useTranslations("templates");
  const tCommon = useTranslations("common");
  const [category, setCategory] = useState<string>("all");

  const {
    workspaceId,
    isLoading: workspaceLoading,
    isError: workspaceError,
    error: workspaceErr,
  } = useActiveWorkspace();
  const {
    data: templates,
    isLoading: templatesLoading,
    isError: templatesError,
    error: templatesErr,
  } = useTemplates(workspaceId);

  const loading = workspaceLoading || (!!workspaceId && templatesLoading);
  const errorMessage =
    (workspaceError &&
      (workspaceErr instanceof Error ? workspaceErr.message : t("failedWorkspace"))) ||
    (templatesError &&
      (templatesErr instanceof Error ? templatesErr.message : t("failedTemplates"))) ||
    null;

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const template of templates ?? []) {
      if (template.category) set.add(template.category);
    }
    return Array.from(set).sort();
  }, [templates]);

  const filtered = useMemo(() => {
    if (!templates) return [];
    if (category === "all") return templates;
    return templates.filter((tpl) => tpl.category === category);
  }, [templates, category]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <PageHeader title={t("title")} description={t("subtitle")} className="mb-6" />

      {errorMessage && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>{tCommon("somethingWentWrong")}</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {!loading && categories.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={category === "all" ? "default" : "outline"}
            className="cursor-pointer rounded-full"
            onClick={() => setCategory("all")}
          >
            {t("allCategories")}
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              size="sm"
              variant={category === cat ? "default" : "outline"}
              className={cn("cursor-pointer rounded-full capitalize")}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      )}

      {loading && <TemplatesSkeleton />}

      {!loading && !errorMessage && filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-card/50 px-6 py-10">
          <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-start">
            <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <LayoutTemplate className="size-5" />
            </div>
            <div>
              <p className="text-base font-semibold">{t("emptyTitle")}</p>
              <p className="text-sm text-muted-foreground">{t("emptyDescription")}</p>
            </div>
          </div>
        </div>
      )}

      {!loading && !errorMessage && filtered.length > 0 && workspaceId && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((template) => (
            <TemplateCard key={template.id} template={template} workspaceId={workspaceId} />
          ))}
        </div>
      )}
    </div>
  );
}
