# Landing shell specification

## Overview
- **Target files:** `src/components/features/landing/*`, `src/app/page.tsx`
- **Interaction model:** mixed (scroll-driven nav + reveals; click-driven solutions/pricing/faq)
- **Brand:** Kanban teal paper-and-ink — not Miro colors

## Computed style targets (Kanban tokens)

### Nav
- sticky top-0 z-50; h-16; max-w-6xl centered
- State A (top): bg-background/80 backdrop-blur, border transparent
- State B (scroll > 48px): bg-background border-border shadow-sm
- Transition: 200ms colors/border

### Hero
- min-h ~[70vh]; padding py-16 md:py-24
- Display headline font-display text-4xl md:text-6xl
- One supporting sentence text-muted-foreground text-lg
- CTA group: primary + outline secondary
- Product visual: dual preview (kanban board + whiteboard canvas mock)

### Solutions
- Click tabs; active: primary underline / bg-muted
- Panel: title + description + visual

## Assets
- `/logo.svg`
- Existing example board in LandingHero
- Whiteboard preview: CSS grid dots + sticky note shapes (no Miro assets)

## Responsive
- Desktop: two-column hero
- Mobile: stack; sticky nav with hamburger
