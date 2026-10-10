"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Search, Sparkles } from "lucide-react";
import { useActiveWorkspace } from "@/components/layout/active-workspace-context";
import { useTemplates } from "@/hooks/use-templates";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/utils";
import {
  TEMPLATE_CATEGORY_IDS,
  TEMPLATE_DESCRIPTION_IDS,
  TEMPLATE_NAME_IDS,
  catalogText,
} from "@/lib/template-catalog";
import { TemplateCard } from "./template-card";

function TemplatesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-md border border-border bg-card p-5">
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
  const catalog = useTranslations("templates.catalog");
  const categoryLabel = (value: string) =>
    catalogText(catalog, "categories", value, TEMPLATE_CATEGORY_IDS);
  const [category, setCategory] = useState<string>("all");
  const [query, setQuery] = useState("");

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
    const q = query.trim().toLowerCase();
    return templates.filter((tpl) => {
      if (category !== "all" && tpl.category !== category) return false;
      if (!q) return true;
      const name = catalogText(catalog, "names", tpl.name, TEMPLATE_NAME_IDS);
      const description = catalogText(
        catalog,
        "descriptions",
        tpl.description,
        TEMPLATE_DESCRIPTION_IDS,
      );
      const categoryName = categoryLabel(tpl.category ?? "");
      return (
        name.toLowerCase().includes(q) ||
        tpl.name.toLowerCase().includes(q) ||
        description.toLowerCase().includes(q) ||
        (tpl.description ?? "").toLowerCase().includes(q) ||
        categoryName.toLowerCase().includes(q) ||
        (tpl.category ?? "").toLowerCase().includes(q) ||
        tpl.snapshot.columns.some((c) => c.title.toLowerCase().includes(q))
      );
    });
  }, [templates, category, query, catalog]);

  const showFeatured = category === "all" && query.trim() === "";
  const featured = useMemo(
    () => (showFeatured ? filtered.filter((tpl) => tpl.isSystem).slice(0, 3) : []),
    [filtered, showFeatured],
  );
  const rest = useMemo(() => {
    const ids = new Set(featured.map((tpl) => tpl.id));
    return filtered.filter((tpl) => !ids.has(tpl.id));
  }, [filtered, featured]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <PageHeader title={t("title")} description={t("subtitle")} className="mb-6" />

      {errorMessage && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>{tCommon("somethingWentWrong")}</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {!loading && (templates?.length ?? 0) > 0 && (
        <div className="relative mb-4 max-w-md">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchPlaceholder")}
            className="ps-9"
          />
        </div>
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
              {categoryLabel(cat)}
            </Button>
          ))}
        </div>
      )}

      {loading && <TemplatesSkeleton />}

      {!loading && !errorMessage && filtered.length === 0 && (
        <div className="max-w-md py-6">
          <p className="text-base font-semibold">
            {(templates?.length ?? 0) > 0 ? t("noResultsTitle") : t("emptyTitle")}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {(templates?.length ?? 0) > 0
              ? t("noResultsDescription")
              : t("emptyDescription")}
          </p>
        </div>
      )}

      {!loading && !errorMessage && featured.length > 0 && workspaceId && (
        <section className="mb-8">
          <h2 className="mb-3 inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-semibold">
            <Sparkles className="size-4 text-primary" />
            {t("featured")}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                workspaceId={workspaceId}
                featured
              />
            ))}
          </div>
        </section>
      )}

      {!loading && !errorMessage && rest.length > 0 && workspaceId && (
        <section>
          {featured.length > 0 && (
            <h2 className="mb-3 inline-flex rounded-md border border-border bg-card px-3 py-1.5 text-sm font-semibold">
              {t("allTemplates")}
            </h2>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((template) => (
              <TemplateCard key={template.id} template={template} workspaceId={workspaceId} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
