"use client";

import {
  LandingNav,
  LandingHero,
  LandingWorkflow,
  LandingFeatures,
  LandingPricing,
  LandingFaq,
  LandingCta,
  LandingFooter,
} from "@/components/features/landing";

export default function HomePage() {
  return (
    <div className="font-waymark min-h-dvh overflow-x-hidden bg-background text-foreground">
      <LandingNav />
      <main>
        <LandingHero />
        <LandingWorkflow />
        <LandingFeatures />
        <LandingPricing />
        <LandingFaq />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  );
}
