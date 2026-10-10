import { Suspense } from "react";
import { PlanningPageView } from "@/components/features/planning/planning-page-view";

export default function PlanningPage() {
  return (
    <Suspense fallback={null}>
      <PlanningPageView />
    </Suspense>
  );
}
