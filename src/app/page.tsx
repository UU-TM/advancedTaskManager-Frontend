"use client";

import {
  LandingNav,
  LandingHero,
  LandingSolutions,
  LandingFeatures,
  LandingIntegrations,
  LandingTestimonials,
  LandingPricing,
  LandingFaq,
  LandingCta,
  LandingFooter,
} from "@/components/features/landing";

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-background">
      <LandingNav />
      <main>
        <LandingHero />
        <LandingSolutions />
        <LandingFeatures />
        <LandingIntegrations />
        <LandingTestimonials />
        <LandingPricing />
        <LandingFaq />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  );
}
