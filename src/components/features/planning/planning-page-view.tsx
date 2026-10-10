"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SprintsPageView } from "@/components/features/sprints/sprints-page-view";
import { GoalsPageView } from "@/components/features/goals/goals-page-view";
import { MilestonesPageView } from "@/components/features/milestones/milestones-page-view";

const TABS = ["sprints", "goals", "milestones"] as const;
type PlanningTab = (typeof TABS)[number];

function parseTab(value: string | null): PlanningTab {
  if (value && (TABS as readonly string[]).includes(value)) {
    return value as PlanningTab;
  }
  return "sprints";
}

export function PlanningPageView() {
  const t = useTranslations("planning");
  const tNav = useTranslations("nav");
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = parseTab(searchParams.get("tab"));

  const setTab = useCallback(
    (next: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", next);
      router.replace(`/planning?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 md:px-6">
      <PageHeader title={t("title")} description={t("subtitle")} />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="sprints">{tNav("sprints")}</TabsTrigger>
          <TabsTrigger value="goals">{tNav("goals")}</TabsTrigger>
          <TabsTrigger value="milestones">{tNav("milestones")}</TabsTrigger>
        </TabsList>
        <TabsContent value="sprints" className="mt-6">
          <SprintsPageView embedded />
        </TabsContent>
        <TabsContent value="goals" className="mt-6">
          <GoalsPageView embedded />
        </TabsContent>
        <TabsContent value="milestones" className="mt-6">
          <MilestonesPageView embedded />
        </TabsContent>
      </Tabs>
    </div>
  );
}
